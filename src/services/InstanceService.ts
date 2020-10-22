import InstanceResponse from '@/@types/graphql/InstancesResponse';
import InstanceStore from '@/store/modules/instance';
import ApolloServiceAbstract from './ApolloServiceAbstract';
import query from '../graphql/instances.query.gql';

/**
 * Service to perform CRUD operations on instances.
 */
export default class InstanceService extends ApolloServiceAbstract {
  async getInstances() {
    InstanceStore.setInstancesLoading(true);

    try {
      const res = await this.client.query<InstanceResponse>({ query });

      if (res.data) {
        const instances = [...res.data.instances.nodes]
          .sort((a, b) => a.description.localeCompare(b.description));

        InstanceStore.setInstances(instances);
      }
    } catch (e) {
      throw e.message;
    } finally {
      InstanceStore.setInstancesLoading(false);
    }
  }
}
