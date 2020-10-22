import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import Group from '@/@types/Group';
import IGroupState from './IGroupState';

@Module({ dynamic: true, store, name: 'group' })
class GroupState extends VuexModule implements IGroupState {
  groups: Group[] = [];

  loading = false;

  selectedGroup: Group|null = null;

  @Mutation
  setGroups(groups: Group[]) {
    this.groups = groups;
  }

  @Mutation
  setSelectedGroup(group: Group|null) {
    this.selectedGroup = group;
  }

  @Mutation
  setGroupsLoading(loading: boolean) {
    this.loading = loading;
  }
}

const GroupModule = getModule(GroupState);
export default GroupModule;
