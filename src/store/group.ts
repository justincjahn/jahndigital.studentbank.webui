import Apollo from '@/services/Apollo';
import gqlGroups from '@/graphql/groups.query.gql';
import gqlNewGroup from '@/graphql/newGroup.mutation.gql';
import gqlUpdateGroup from '@/graphql/updateGroup.mutation.gql';
import gqlDeleteGroup from '@/graphql/deleteGroup.mutation.gql';
import theInstanceStore, { InstanceStore } from '@/store/instance';
import { computed, reactive, watchEffect } from 'vue';

/**
 * Stores information regarding the groups of the currently selected Instance and
 * enables CRUD operations.
 *
 * @param instanceStore The InstanceStore to use.
 */
export function setup(instanceStore: InstanceStore) {
  const store = reactive({
    selected: null as Group|null,
    groups: [] as Group[],
    loading: false,
  });

  // GETs the selected group
  const selected = computed(() => store.selected);

  // GETs the currently loaded list of groups
  const groups = computed(() => store.groups);

  // GETs the loading state of the fetch operation
  const loading = computed(() => store.loading);

  // SETs the selected group
  function setSelected(item: Group|null) {
    store.selected = store.groups.find((x) => x.id === item?.id) ?? null;
  }

  // Fetch the groups of a specific instance.
  async function fetchGroups(instanceId: number) {
    store.loading = true;

    try {
      const res = await Apollo.query<GroupResponse>({
        query: gqlGroups,
        variables: {
          instanceId,
        },
      });

      if (res.data) {
        store.groups = res.data.groups.nodes;
      }
    } catch (e) {
      throw e.message;
    } finally {
      store.loading = false;
    }
  }

  // Create a new instance using the GraphQL API and mutate state.
  async function newGroup(input: NewGroupRequest) {
    try {
      const res = await Apollo.mutate<NewGroupResponse>({
        mutation: gqlNewGroup,
        variables: input,
        update(cache, data) {
          const group = data.data?.newGroup;
          if (!group) return;

          cache.writeQuery<GroupResponse>({
            query: gqlGroups,
            data: {
              groups: {
                nodes: [...store.groups, ...group],
              },
            },
          });
        },
      });

      if (res.data) {
        store.groups = [...store.groups, ...res.data.newGroup];
        return res.data.newGroup[0];
      }

      throw new Error('Unable to create group: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Create a new group using the GraphQL API and mutate state.
  async function updateGroup(input: UpdateGroupRequest) {
    try {
      const res = await Apollo.mutate<UpdateGroupResponse>({
        mutation: gqlUpdateGroup,
        variables: input,
      });

      if (res.data) {
        store.groups = [
          ...store.groups.filter((x: Group) => x.id !== res.data?.updateGroup[0].id),
          ...res.data.updateGroup,
        ];

        return res.data.updateGroup[0];
      }

      throw new Error('Unable to create instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Delete a group using the GraphQL API and mutate state.
  async function deleteGroup(group: Group) {
    try {
      const res = await Apollo.mutate<DeleteGroupResponse>({
        mutation: gqlDeleteGroup,
        variables: {
          id: group.id,
        },
      });

      if (res.data && res.data.deleteGroup === true) {
        store.groups = store.groups.filter((x: Group) => x.id !== group.id);

        if (store.selected === group) {
          store.selected = null;
        }

        return;
      }

      throw new Error('Unable to delete instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  watchEffect(() => {
    if (instanceStore.selected.value === null) {
      store.groups = [];
    } else {
      fetchGroups(instanceStore.selected.value.id);
    }

    if (instanceStore.selected.value?.id !== store.selected?.instanceId ?? false) {
      store.selected = null;
    }
  });

  return {
    instanceStore,
    selected,
    groups,
    loading,
    setSelected,
    fetchGroups,
    newGroup,
    updateGroup,
    deleteGroup,
  };
}

const store = setup(theInstanceStore);
export type GroupStore = ReturnType<typeof setup>;
export default store;
