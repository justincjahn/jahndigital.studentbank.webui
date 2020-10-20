import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import Group from '@/@types/Group';
import IGroupState from './IGroupState';

@Module({ dynamic: true, store, name: 'group' })
class GroupState extends VuexModule implements IGroupState {
  groups: Group[] = [];

  loading = false;

  selectedGroup?: Group;

  @Mutation
  setGroups(groups: Group[]) {
    this.groups = groups;
  }
}

const GroupModule = getModule(GroupState);
export default GroupModule;
