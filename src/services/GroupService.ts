import GroupResponse from '@/@types/graphql/GroupResponse';
import GroupStore from '@/store/modules/group';
import ApolloServiceAbstract from './ApolloServiceAbstract';
import query from '../graphql/groups.query.gql';

/**
 * Service to perform CRUD operations on groups.
 */
export default class GroupService extends ApolloServiceAbstract {
  async getGroups(instanceId: number) {
    GroupStore.setGroupsLoading(true);

    try {
      const res = await this.client.query<GroupResponse>({
        query,
        variables: {
          instanceId,
        },
      });

      if (res.data) {
        const groups = [...res.data.groups.nodes]
          .sort((a, b) => a.name.localeCompare(b.name));

        GroupStore.setGroups(groups);
      }
    } catch (e) {
      throw e.message;
    } finally {
      GroupStore.setGroupsLoading(false);
    }
  }
}
