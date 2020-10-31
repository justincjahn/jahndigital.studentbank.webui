/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
import { getModule, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import Group from '@/@types/Group';
import Apollo from '@/services/Apollo';
import GroupsQuery from '@/graphql/groups.query.gql';
import GroupNew from '@/graphql/newGroup.mutation.gql';
import GroupUpdate from '@/graphql/updateGroup.mutation.gql';
import GroupDelete from '@/graphql/deleteGroup.mutation.gql';
import GroupResponse from '@/@types/graphql/GroupResponse';
import NewGroupRequest from '@/@types/graphql/NewGroupRequest';
import NewGroupResponse from '@/@types/graphql/NewGroupResponse';
import UpdateGroupRequest from '@/@types/graphql/UpdateGroupRequest';
import UpdateGroupResponse from '@/@types/graphql/UpdateGroupResponse';
import DeleteGroupResponse from '@/@types/graphql/DeleteGroupResponse';
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

  /**
   * Create a new instance using the GraphQL API and mutate state.
   *
   * @param input The instance information.
   */
  @MutationAction
  async newGroup(input: NewGroupRequest) {
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<NewGroupResponse>({
        mutation: GroupNew,
        variables: input,
      });

      if (res.data) {
        const groups = [...self.state.groups, ...res.data.newGroup];
        return { groups, selectedGroup: res.data.newGroup[0] };
      }

      throw new Error('Unable to create group: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Create a new group using the GraphQL API and mutate state.
   *
   * @param input The instance information.
   */
  @MutationAction
  async updateGroup(input: UpdateGroupRequest) {
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<UpdateGroupResponse>({
        mutation: GroupUpdate,
        variables: input,
      });

      if (res.data) {
        const groups = [
          ...self.state.groups.filter((x: Group) => x.id !== res.data?.updateGroup[0].id),
          ...res.data.updateGroup,
        ];

        return { groups, selectedGroup: res.data.updateGroup[0] };
      }

      throw new Error('Unable to create instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Delete a group using the GraphQL API and mutate state.
   *
   * @param instance The instance to delete.
   */
  @MutationAction
  async deleteGroup(group: Group) {
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<DeleteGroupResponse>({
        mutation: GroupDelete,
        variables: {
          id: group.id,
        },
      });

      if (res.data && res.data.deleteGroup === true) {
        const groups = self.state.groups.filter((x: Group) => x.id !== group.id);
        return { groups, selectedGroup: null as Group|null };
      }

      throw new Error('Unable to delete instance: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
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
