import * as groupService from '@/services/group';
import { InstanceStore } from '@/modules/admin/stores/instance';
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

  /**
   * SETs the selected group
   *
   * @param item
   */
  function setSelected(item: Group|null) { store.selected = item; }

  /**
   * Fetch the groups of a specific instance.
   *
   * @param instanceId
   * @param cache
   */
  async function fetchGroups(instanceId: number, cache = true) {
    store.loading = true;

    try {
      const data = await groupService.getGroups({ instanceId, cache });
      store.groups = data.groups.nodes;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Create a new instance using the GraphQL API and mutate state.
   *
   * @param input
   */
  async function newGroup(input: NewGroupRequest) {
    const data = await groupService.newGroup(input);
    const [group] = data.newGroup;
    store.groups = [...store.groups, group];
    return group;
  }

  /**
   * Create a new group using the GraphQL API and mutate state.
   *
   * @param input
   */
  async function updateGroup(input: UpdateGroupRequest) {
    const data = await groupService.updateGroup(input);
    store.groups = [
      ...store.groups.filter((x: Group) => x.id !== data?.updateGroup[0].id),
      ...data.updateGroup,
    ];

    return data.updateGroup[0];
  }

  /**
   * Delete a group using the GraphQL API and mutate state.
   *
   * @param group
   */
  async function deleteGroup(group: Group) {
    const data = await groupService.deleteGroup(group);

    if (data.deleteGroup === true) {
      store.groups = store.groups.filter((x) => x.id !== group.id);
      if (store.selected === group) { store.selected = null; }
      return;
    }

    throw new Error('Unable to delete instance: unknown error.');
  }

  // Watch for selected instance changes and fetch new groups
  // @NOTE Not using watchEffect here because we don't want to watch store.groups changes.
  watch(() => instanceStore.selected.value, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      if (newValue === null) {
        store.groups = [];
      } else if (typeof newValue !== 'undefined') {
        fetchGroups(newValue.id);
      }
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

export type GroupStore = ReturnType<typeof setup>;
