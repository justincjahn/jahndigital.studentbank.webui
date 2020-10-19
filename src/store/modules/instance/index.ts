import {
  Module,
  VuexModule,
  Mutation,
  getModule,
} from 'vuex-module-decorators';
import store from '@/store';
import Instance from '@/@types/Instance';
import IInstanceState from './IInstanceState';

@Module({ dynamic: true, store, name: 'instance' })
class InstanceState extends VuexModule implements IInstanceState {
  public instances: Instance[] = [];

  public loading = false;

  @Mutation
  setInstances(instances: Instance[]) {
    this.instances = instances;
  }

  @Mutation
  setLoading(loading: boolean) {
    this.loading = loading;
  }
}

const InstanceModule = getModule(InstanceState);
export default InstanceModule;
