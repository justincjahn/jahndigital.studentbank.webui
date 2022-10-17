import { computed, reactive, watch } from 'vue';

// Types
import type { InstanceStore } from '@//admin/common/stores/instance';

import type {
  Group,
  NewGroupRequest,
  UpdateGroupRequest,
} from '@/admin/common/services/group';

// Services
import {
  getGroups,
  newGroup,
  updateGroup,
  deleteGroup,
} from '@/admin/common/services/group';

/**
 * Stores information regarding the groups of the currently selected Instance and
 * enables CRUD operations.  Groups are collections of students/people- i.e., classes.
 *
 * @param {InstanceStore} instanceStore Watches the selected instance and fetches groups for it automatically.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setup(instanceStore: InstanceStore) {
  const store = reactive({
    selected: null as Group | null,
    groups: [] as Group[],
    loading: false,
  });

  // Get or set the selected group
  const selected = computed({
    get() {
      return store.selected;
    },

    set(value) {
      store.selected = value;
    },
  });

  // GETs the currently loaded list of groups
  const groups = computed(() => store.groups);

  // GETs the loading state of the fetch operation
  const loading = computed(() => store.loading);

  /**
   * Fetch the groups of a specific instance.
   *
   * @param instanceId
   * @param cache
   */
  async function fetch(instanceId: number, cache = true) {
    store.loading = true;

    try {
      const data = await getGroups({ instanceId, cache });
      store.groups = data.groups?.nodes || [];
    } finally {
      store.loading = false;
    }
  }

  /**
   * Create a new instance using the GraphQL API and mutate state.
   *
   * @param input
   */
  async function create(input: NewGroupRequest) {
    const data = await newGroup({
      ...input,
      instanceId: instanceStore.selected.value?.id ?? -1,
    });

    const [group] = data.newGroup;
    store.groups = [...store.groups, group];
    return group;
  }

  /**
   * Create a new group using the GraphQL API and mutate state.
   *
   * @param input
   */
  async function update(input: Omit<UpdateGroupRequest, 'instanceId'>) {
    const data = await updateGroup({
      ...input,
      instanceId: instanceStore.selected.value?.id ?? -1,
    });

    const groupList = [
      ...store.groups.filter((x: Group) => x.id !== data?.updateGroup[0].id),
      ...data.updateGroup,
    ];

    groupList.sort((a, b) => (a.name > b.name ? 1 : -1));
    store.groups = groupList;

    return data.updateGroup[0];
  }

  /**
   * Delete a group using the GraphQL API and mutate state.
   *
   * @param group
   */
  async function remove(group: Group) {
    const data = await deleteGroup(group);

    if (data.deleteGroup === true) {
      store.groups = store.groups.filter((x) => x.id !== group.id);
      if (store.selected === group) {
        store.selected = null;
      }
      return;
    }

    throw new Error('Unable to delete instance: unknown error.');
  }

  // Watch for selected instance changes and fetch new groups
  watch(
    () => instanceStore.selected.value,
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue === null) {
          store.groups = [];
        } else if (typeof newValue !== 'undefined') {
          fetch(newValue.id);
        }
      }

      if (
        instanceStore.selected.value?.id !== store.selected?.instanceId ??
        false
      ) {
        store.selected = null;
      }
    },
    { immediate: true }
  );

  return {
    selected,
    groups,
    loading,
    instanceStore,
    fetch,
    create,
    update,
    remove,
  };
}

export type GroupStore = ReturnType<typeof setup>;
