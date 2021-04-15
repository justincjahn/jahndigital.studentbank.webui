import Apollo from '@/services/Apollo';
import gqlGroups from '@/modules/admin/graphql/queries/groupsByInstance.gql';
import gqlNewGroup from '@/modules/admin/graphql/mutations/groupCreate.gql';
import gqlUpdateGroup from '@/modules/admin/graphql/mutations/groupUpdate.gql';
import gqlDeleteGroup from '@/modules/admin/graphql/mutations/groupDelete.gql';
import theInstanceStore, { InstanceStore } from '@/store/instance';
import { computed, reactive, watch } from 'vue';

/**
 * Stores information regarding the groups of the currently selected Instance and
 * enables CRUD operations.  Groups are collections of students/people- i.e., classes.
 *
 * @param {InstanceStore} instanceStore Watches the selected instance and fetches groups for it automatically.
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
  function setSelected(item: Group|null) { store.selected = item; }

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
        const [group] = res.data.newGroup;
        store.groups = [...store.groups, group];
        return group;
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
        update(cache, data) {
          const group = data.data?.updateGroup;
          if (!group) return;

          cache.writeQuery<GroupResponse>({
            query: gqlGroups,
            data: {
              groups: {
                nodes: [
                  ...store.groups.filter((x: Group) => x.id !== group[0].id),
                  ...group,
                ],
              },
            },
          });
        },
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
        update(cache, data) {
          const wasDeleted = data.data?.deleteGroup;
          if (!wasDeleted) return;

          cache.writeQuery<GroupResponse>({
            query: gqlGroups,
            data: {
              groups: {
                nodes: store.groups.filter((x: Group) => x.id !== group.id),
              },
            },
          });
        },
      });

      if (res.data && res.data.deleteGroup === true) {
        store.groups = store.groups.filter((x) => x.id !== group.id);
        if (store.selected === group) { store.selected = null; }
        return;
      }

      throw new Error('Unable to delete instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Watch for selected instance changes and fetch new groups
  // @NOTE Not using watchEffect here because we don't want to watch store.groups changes.
  watch(() => instanceStore.selected.value, () => {
    if (instanceStore.selected.value === null) {
      store.groups = [];
    } else {
      fetchGroups(instanceStore.selected.value.id);
    }

    if (instanceStore.selected.value?.id !== store.selected?.instanceId ?? false) {
      store.selected = null;
    }
  }, { immediate: true });

  return {
    selected,
    groups,
    loading,
    instanceStore,
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
