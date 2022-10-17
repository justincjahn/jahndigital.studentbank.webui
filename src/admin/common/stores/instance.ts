import { computed, reactive } from 'vue';

import type { Instance } from '@/admin/common/services/instance';

import {
  getInstances,
  newInstance,
  updateInstance,
  deleteInstance,
} from '@/admin/common/services/instance';

// Instances are global so instead of managing data per store instance, do it globally
const instanceCache = reactive({
  instances: [] as Instance[],
});

/**
 * Stores information regarding the database instances and which one is currently active and
 * enables CRUD operations for instances.  Instances are in essence bespoke operating environments
 * with their own groups, students, stocks, share types, etc.  They are most often used to create
 * new environments for new terms/groups of students/people.
 */
export function setup() {
  const store = reactive({
    selected: null as Instance | null,
    loading: false,
  });

  // Get or set the currently selected instance
  const selected = computed({
    get: () => store.selected,
    set: (value: Instance | null) => {
      store.selected = value;
    },
  });

  // Get a list of instances
  const instances = computed(() => instanceCache.instances);

  // True if the store is fetching data
  const loading = computed(() => store.loading);

  /**
   * Fetch instances from the server and select one if nothing is selected.
   *
   * @param cache
   */
  async function fetch(cache = true) {
    store.loading = true;

    try {
      const data = await getInstances(cache);
      if (!data.instances || !data.instances.nodes) return;

      instanceCache.instances = data.instances.nodes;

      const active = instanceCache.instances.findIndex(
        (x) => x.isActive === true
      );

      // Only set the instance if we don't already have a valid one selected
      const sid = store.selected?.id ?? -1;
      const hasSelected = instanceCache.instances.findIndex(
        (x) => x.id === sid
      );
      if (hasSelected <= 0) {
        selected.value = instanceCache.instances[active > -1 ? active : 0];
      }
    } finally {
      store.loading = false;
    }
  }

  /**
   * Create a new instance.
   *
   * @param input
   * @returns The newly created instance.
   */
  async function create(input: Parameters<typeof newInstance>[0]) {
    const data = await newInstance(input);
    instanceCache.instances = [...instanceCache.instances, data.newInstance];
    return data.newInstance;
  }

  /**
   * Update an instance.
   *
   * @param input
   * @returns The updated instance.
   */
  async function update(input: Parameters<typeof updateInstance>[0]) {
    const data = await updateInstance(input);

    // If we've activated an instance, then we need to update all of them
    let existing = [...instanceCache.instances];
    if (input.isActive && input.isActive === true) {
      existing = instanceCache.instances.map((x: Instance) => ({
        ...x,
        isActive: false,
      }));
    }

    const instanceList = [
      ...existing.filter((x: Instance) => x.id !== data.updateInstance[0].id),
      ...data.updateInstance,
    ];

    instanceList.sort((a, b) => (a.description > b.description ? 1 : -1));

    instanceCache.instances = instanceList;
    return data.updateInstance[0];
  }

  /**
   * Delete an instance.
   *
   * @param instance
   */
  async function remove(instance: Instance) {
    const data = await deleteInstance({ id: instance.id });

    if (data.deleteInstance === true) {
      instanceCache.instances = instanceCache.instances.filter(
        (x) => x.id !== instance.id
      );
    } else {
      throw new Error('Unable to delete instance: unknown error.');
    }
  }

  return {
    selected,
    instances,
    loading,
    fetch,
    create,
    update,
    remove,
  };
}

export type InstanceStore = ReturnType<typeof setup>;
