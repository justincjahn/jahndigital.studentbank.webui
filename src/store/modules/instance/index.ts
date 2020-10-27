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
import Instance from '@/@types/Instance';
import InstanceResponse from '@/@types/graphql/InstancesResponse';
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

  @Mutation
  setSelectedInstance(instance: Instance) {
    this.selectedInstance = instance;
  }

  @Mutation
  setInstancesLoading(loading: boolean) {
    this.loading = loading;
  }
}

const InstanceModule = getModule(InstanceState);
export default InstanceModule;
