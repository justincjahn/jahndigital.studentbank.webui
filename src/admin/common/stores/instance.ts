import { computed, reactive } from 'vue';

import * as instanceService from '@/admin/common/services/instance';

type Instance = instanceService.Instance;

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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setup() {
  const store = reactive({
    selected: null as Instance | null,
    loading: false,
  });

  const selected = computed({
    get: () => store.selected,
    set: (value: Instance | null) => {
      store.selected = value;
    },
  });

  const instances = computed(() => instanceCache.instances);

  const loading = computed(() => store.loading);

  /**
   * Fetch instances from the server.
   *
   * @param cache
   */
  async function fetch(cache = true) {
    store.loading = true;

    try {
      const data = await instanceService.getInstances(cache);
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
  async function newInstance(
    input: Parameters<typeof instanceService.newInstance>[0]
  ) {
    const data = await instanceService.newInstance(input);
    instanceCache.instances = [...instanceCache.instances, data.newInstance];
    return data.newInstance;
  }

  /**
   * Update an instance.
   *
   * @param input
   * @returns The updated instance.
   */
  async function updateInstance(
    input: Parameters<typeof instanceService.updateInstance>[0]
  ) {
    const data = await instanceService.updateInstance(input);

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

    instanceCache.instances = instanceList;
    return data.updateInstance[0];
  }

  /**
   * Delete an instance.
   *
   * @param instance
   */
  async function deleteInstance(instance: Instance) {
    const data = await instanceService.deleteInstance({ id: instance.id });
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
    fetchInstances: fetch,
    newInstance,
    updateInstance,
    deleteInstance,
  };
}

export type InstanceStore = ReturnType<typeof setup>;
