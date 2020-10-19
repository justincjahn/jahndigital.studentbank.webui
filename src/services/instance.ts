import InstanceResponse from '@/@types/graphql/InstancesResponse';
import InstanceStore from '@/store/modules/instance';
import { authQuery } from '@/utils/request';
import query from '../graphql/instances.query.gql';

export default {
  /**
   * Get a list of instances.
   */
  getInstances: async () => {
    InstanceStore.setLoading(true);

    try {
      const res = await authQuery<InstanceResponse>({
        query,
      });

      if (res.data) {
        const instances = [...res.data.instances.nodes]
          .sort((a, b) => a.description.localeCompare(b.description));

        InstanceStore.setInstances(instances);
      }
    } catch (e) {
      throw e.message;
    } finally {
      InstanceStore.setLoading(false);
    }
  },
};
