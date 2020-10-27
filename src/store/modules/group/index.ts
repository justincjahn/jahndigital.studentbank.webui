/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
import { getModule, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import Group from '@/@types/Group';
import Apollo from '@/services/Apollo';
import GroupResponse from '@/@types/graphql/GroupResponse';
import GroupsQuery from '@/graphql/groups.query.gql';
import IGroupState from './IGroupState';

type fetchOptions = { instanceId: number };

@Module({ dynamic: true, store, name: 'group' })
class GroupState extends VuexModule implements IGroupState {
  groups: Group[] = [];

  loading = false;

  selectedGroup: Group|null = null;

  /**
   * Fetch groups from the GraphQL API
   *
   * @param options Fetch options
   */
  @MutationAction
  async fetchGroups(options: fetchOptions) {
    const self = this as Record<string, any>;
    self.commit('setGroupsLoading', true);

    try {
      const res = await Apollo.query<GroupResponse>({
        query: GroupsQuery,
        variables: {
          instanceId: options.instanceId,
        },
      });

      if (res.data) {
        return { groups: res.data.groups.nodes };
      }
    } catch (e) {
      throw e.message;
    } finally {
      self.commit('setGroupsLoading', false);
    }

    return { groups: [] };
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
