import Apollo from '@/services/Apollo';
import gqlInstances from '@/graphql/instances.query.gql';
import gqlNewInstance from '@/graphql/newInstance.mutation.gql';
import gqlUpdateInstance from '@/graphql/updateInstance.mutation.gql';
import gqlDeleteInstance from '@/graphql/deleteInstance.mutation.gql';
import { computed, reactive } from 'vue';

/**
 * Stores information regarding the database instances and which one is currently active and
 * enables CRUD operations for instances.  Instances are in essence bespoke operating environments
 * with their own groups, students, stocks, share types, etc.  They are most often used to create
 * new environments for new terms/groups of students/people.
 */
export function setup() {
  const store = reactive({
    selected: null as Instance|null,
    instances: [] as Instance[],
    loading: false,
  });

  // GETs the selected instance
  const selected = computed(() => store.selected);

  // GETs a list of instances
  const instances = computed(() => store.instances);

  // GETs the loading state of fetch requests
  const loading = computed(() => store.loading);

  // SETs (or clears) the selected instance.
  function setSelected(item: Instance|null) { store.selected = item; }

  // Fetch instances from the server
  async function fetchInstances() {
    store.loading = true;

    try {
      const res = await Apollo.query<InstanceResponse>({
        query: gqlInstances,
      });

      if (res.data) {
        store.instances = res.data.instances.nodes;
        const active = store.instances.findIndex((x) => x.isActive === true);
        setSelected(store.instances[active > -1 ? active : 0]);
      }
    } catch (e) {
      throw e.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  // Create a new instance
  async function newInstance(input: NewInstanceRequest) {
    try {
      const res = await Apollo.mutate<NewInstanceResponse>({
        mutation: gqlNewInstance,
        variables: input,
        update(cache, data) {
          const instance = data.data?.newInstance;
          if (!instance) return;

          cache.writeQuery<InstanceResponse>({
            query: gqlInstances,
            data: {
              instances: {
                nodes: [...store.instances, instance],
              },
            },
          });
        },
      });

      if (res.data) {
        store.instances = [...store.instances, res.data.newInstance];
        return res.data.newInstance;
      }

      throw new Error('Unable to create instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Update an instance
  async function updateInstance(input: UpdateInstanceRequest) {
    try {
      const res = await Apollo.mutate<UpdateInstanceResponse>({
        mutation: gqlUpdateInstance,
        variables: input,
      });

      if (res.data) {
        // If we've activated an instance, then we need to update all of them
        let existing = [...store.instances];
        if (input.isActive && input.isActive === true) {
          existing = store.instances.map((x: Instance) => ({
            ...x,
            isActive: false,
          }));
        }

        const instanceList = [
          ...existing.filter((x: Instance) => x.id !== res.data?.updateInstance[0].id),
          ...res.data.updateInstance,
        ];

        store.instances = instanceList;
        return res.data.updateInstance[0];
      }

      throw new Error('Unable to update instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Delete an instance
  async function deleteInstance(instance: Instance) {
    try {
      const res = await Apollo.mutate<DeleteInstanceResponse>({
        mutation: gqlDeleteInstance,
        variables: {
          id: instance.id,
        },
        update(cache, data) {
          const wasDeleted = data.data?.deleteInstance;
          if (!wasDeleted) return;

          cache.writeQuery<InstanceResponse>({
            query: gqlInstances,
            data: {
              instances: {
                nodes: store.instances.filter((x: Instance) => x.id !== instance.id),
              },
            },
          });
        },
      });

      if (res.data && res.data.deleteInstance === true) {
        store.instances = store.instances.filter((x) => x.id !== instance.id);
        return;
      }

      throw new Error('Unable to delete instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  return {
    selected,
    instances,
    loading,
    setSelected,
    fetchInstances,
    newInstance,
    updateInstance,
    deleteInstance,
  };
}

const store = setup();
export type InstanceStore = ReturnType<typeof setup>;
export default store;
