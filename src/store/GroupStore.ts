import Apollo from '@/services/Apollo';
import gqlGroups from '@/graphql/groups.query.gql';
import gqlNewGroup from '@/graphql/newGroup.mutation.gql';
import gqlUpdateGroup from '@/graphql/updateGroup.mutation.gql';
import gqlDeleteGroup from '@/graphql/deleteGroup.mutation.gql';
import instanceStore from '@/store/InstanceStore';
import { ref, watchEffect } from 'vue';

/**
 * Stores global information for groups.
 */
class GroupStore {
  // The currently selected group (if any).
  protected _selected = ref<Group|null>(null);

  // The list of available groups.
  protected _groups = ref<Group[]>([]);

  // If the store is currently loading/submitting data
  protected _loading = ref(false);

  // Watch for instance changes and refetch
  constructor() {
    watchEffect(() => {
      if (instanceStore.selected.value === null) {
        this._groups.value = [];
      } else {
        this.fetchGroups(instanceStore.selected.value.id);
      }

      if (instanceStore.selected.value?.id !== this._selected.value?.instanceId ?? false) {
        this._selected.value = null;
      }
    });
  }

  // GETs the selected group (if any)
  public get selected() { return this._selected; }

  // SETs the selected group, or clear is.
  public setSelected(item: Group|null) {
    if (item === null) {
      this._selected.value = null;
      return;
    }

    this._selected.value = this._groups.value.find((x) => x.id === item.id) ?? null;
  }

  // GETs a list of groups
  public get groups() { return this._groups; }

  // Fetch the groups of a specific instance.
  public async fetchGroups(instanceId: number) {
    this._loading.value = true;

    try {
      const res = await Apollo.query<GroupResponse>({
        query: gqlGroups,
        variables: {
          instanceId,
        },
      });

      if (res.data) {
        this._groups.value = res.data.groups.nodes;
      }
    } catch (e) {
      throw e.message;
    } finally {
      this._loading.value = false;
    }
  }

  // Create a new instance using the GraphQL API and mutate state.
  async newGroup(input: NewGroupRequest) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<NewGroupResponse>({
        mutation: gqlNewGroup,
        variables: input,
        update(cache, data) {
          const newGroup = data.data?.newGroup;
          cache.writeQuery<GroupResponse>({
            query: gqlGroups,
            data: {
              groups: {
                nodes: [...self.state.groups, newGroup],
              },
            },
          });
        },
      });

      if (res.data) {
        this._groups.value = [...this._groups.value, ...res.data.newGroup];
        return res.data.newGroup[0];
      }

      throw new Error('Unable to create group: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Create a new group using the GraphQL API and mutate state.
  async updateGroup(input: UpdateGroupRequest) {
    try {
      const res = await Apollo.mutate<UpdateGroupResponse>({
        mutation: gqlUpdateGroup,
        variables: input,
      });

      if (res.data) {
        const groups = [
          ...this._groups.value.filter((x: Group) => x.id !== res.data?.updateGroup[0].id),
          ...res.data.updateGroup,
        ];

        this._groups.value = groups;
        return res.data.updateGroup[0];
      }

      throw new Error('Unable to create instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Delete a group using the GraphQL API and mutate state.
  async deleteGroup(group: Group) {
    try {
      const res = await Apollo.mutate<DeleteGroupResponse>({
        mutation: gqlDeleteGroup,
        variables: {
          id: group.id,
        },
      });

      if (res.data && res.data.deleteGroup === true) {
        this._groups.value = this._groups.value.filter((x: Group) => x.id !== group.id);

        if (this._selected.value === group) {
          this._selected.value = null;
        }

        return;
      }

      throw new Error('Unable to delete instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }
}

const groupStore = new GroupStore();
export default groupStore;
