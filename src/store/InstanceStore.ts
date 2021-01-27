import Apollo from '@/services/Apollo';
import gqlInstances from '@/graphql/instances.query.gql';
import gqlNewInstance from '@/graphql/newInstance.mutation.gql';
import gqlUpdateInstance from '@/graphql/updateInstance.mutation.gql';
import gqlDeleteInstance from '@/graphql/deleteInstance.mutation.gql';
import { ref } from 'vue';

/**
 * Stores global information for instances.
 */
class InstanceStore {
  // The currently selected instances (if any).
  protected _selected = ref<Instance|null>(null);

  // The list of available instances.
  protected _instances = ref<Instance[]>([]);

  // If the store is currently loading/submitting data
  protected _loading = ref(false);

  // On instantiation, fetch instances
  // constructor() { this.fetchInstances(); }

  // GETs the selected instance
  public get selected() { return this._selected; }

  // SETs (or clears) the selected instance.
  public setSelected(item: Instance|null) { this._selected.value = item; }

  // GETS a list of instances
  public get instances() { return this._instances; }

  // Fetch instances from the server
  public async fetchInstances() {
    this._loading.value = true;

    try {
      const res = await Apollo.query<InstanceResponse>({
        query: gqlInstances,
      });

      if (res.data) {
        this._instances.value = res.data.instances.nodes;
        const active = this._instances.value.findIndex((x) => x.isActive === true);
        this.setSelected(this._instances.value[active > -1 ? active : 0]);
      }
    } catch (e) {
      throw e.message ?? e;
    } finally {
      this._loading.value = false;
    }
  }

  // Create a new instance
  async newInstance(input: NewInstanceRequest) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<NewInstanceResponse>({
        mutation: gqlNewInstance,
        variables: input,
        update(cache, data) {
          const newInstance = data.data?.newInstance;
          cache.writeQuery<InstanceResponse>({
            query: gqlInstances,
            data: {
              instances: {
                nodes: [...self.instances.value, newInstance],
              },
            },
          });
        },
      });

      if (res.data) {
        this._instances.value = [...this._instances.value, res.data.newInstance];
        return res.data.newInstance;
      }

      throw new Error('Unable to create instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Update an instance
  async updateInstance(input: UpdateInstanceRequest) {
    try {
      const res = await Apollo.mutate<UpdateInstanceResponse>({
        mutation: gqlUpdateInstance,
        variables: input,
      });

      if (res.data) {
        const instances = [
          ...this._instances.value.filter((x: Instance) => x.id !== res.data?.updateInstance[0].id),
          ...res.data.updateInstance,
        ];

        this._instances.value = instances;
        return res.data.updateInstance[0];
      }

      throw new Error('Unable to update instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Delete an instance
  async deleteInstance(instance: Instance) {
    try {
      const res = await Apollo.mutate<DeleteInstanceResponse>({
        mutation: gqlDeleteInstance,
        variables: {
          id: instance.id,
        },
      });

      if (res.data && res.data.deleteInstance === true) {
        this._instances.value = this._instances.value.filter((x) => x.id !== instance.id);
        return;
      }

      throw new Error('Unable to delete instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }
}

const instanceStore = new InstanceStore();
export default instanceStore;
