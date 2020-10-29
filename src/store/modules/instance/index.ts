/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Module,
  VuexModule,
  Mutation,
  getModule,
  MutationAction,
} from 'vuex-module-decorators';
import store from '@/store';
import Apollo from '@/services/Apollo';
import InstanceQuery from '@/graphql/instances.query.gql';
import InstanceDelete from '@/graphql/deleteInstance.mutation.gql';
import InstanceNew from '@/graphql/newInstance.mutation.gql';
import InstanceUpdate from '@/graphql/updateInstance.mutation.gql';
import DeleteInstanceResponse from '@/@types/graphql/DeleteInstanceResponse';
import InstanceResponse from '@/@types/graphql/InstancesResponse';
import NewInstanceRequest from '@/@types/graphql/NewInstanceRequest';
import NewInstanceResponse from '@/@types/graphql/NewInstanceResponse';
import UpdateInstanceRequest from '@/@types/graphql/UpdateInstanceRequest';
import UpdateInstanceResponse from '@/@types/graphql/UpdateInstanceResponse';
import Instance from '@/@types/Instance';
import IInstanceState from './IInstanceState';

@Module({ dynamic: true, store, name: 'instance' })
class InstanceState extends VuexModule implements IInstanceState {
  public instances: Instance[] = [];

  public selectedInstance: Instance|null = null;

  public loading = false;

  /**
   * Fetch instances from the GraphQL API.
   */
  @MutationAction
  async fetchInstances() {
    const self = this as Record<string, any>;
    self.commit('setInstancesLoading', true);

    try {
      const res = await Apollo.query<InstanceResponse>({
        query: InstanceQuery,
      });

      if (res.data) {
        return {
          instances: res.data.instances.nodes,
        };
      }
    } catch (e) {
      throw e.message ?? e;
    } finally {
      self.commit('setInstancesLoading', true);
    }

    return { instances: [] };
  }

  /**
   * Create a new instance using the GraphQL API and mutate state.
   *
   * @param input The instance information.
   */
  @MutationAction
  async newInstance(input: NewInstanceRequest) {
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<NewInstanceResponse>({
        mutation: InstanceNew,
        variables: input,
      });

      if (res.data) {
        const instances = [...self.state.instances, res.data.newInstance];
        return { instances, selectedInstance: res.data.newInstance };
      }

      throw new Error('Unable to create instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Create a new instance using the GraphQL API and mutate state.
   *
   * @param input The instance information.
   */
  @MutationAction
  async updateInstance(input: UpdateInstanceRequest) {
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<UpdateInstanceResponse>({
        mutation: InstanceUpdate,
        variables: input,
      });

      if (res.data) {
        const instances = [
          ...self.state.instances.filter((x: Instance) => x.id !== res.data?.updateInstance[0].id),
          ...res.data.updateInstance,
        ];

        return { instances, selectedInstance: res.data.updateInstance[0] };
      }

      throw new Error('Unable to create instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Delete an instance using the GraphQL API and mutate state.
   *
   * @param instance The instance to delete.
   */
  @MutationAction
  async deleteInstance(instance: Instance) {
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<DeleteInstanceResponse>({
        mutation: InstanceDelete,
        variables: {
          id: instance.id,
        },
      });

      if (res.data && res.data.deleteInstance === true) {
        const instances = self.state.instances.filter((x: Instance) => x.id !== instance.id);
        return { instances, selectedInstance: null as Instance|null };
      }

      throw new Error('Unable to delete instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Mutate state to select the provided instance.
   *
   * @param instance The instance to select.
   */
  @Mutation
  setSelectedInstance(instance: Instance|null) {
    this.selectedInstance = instance;
  }

  /**
   * Mutate state to set loading status.
   *
   * @param loading The loading state.
   */
  @Mutation
  setInstancesLoading(loading: boolean) {
    this.loading = loading;
  }
}

const InstanceModule = getModule(InstanceState);
export default InstanceModule;
