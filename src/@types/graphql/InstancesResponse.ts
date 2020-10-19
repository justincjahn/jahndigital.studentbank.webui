import Instance from '../Instance';

/**
 * GraphQL response when querying for instances.
 */
type InstanceResponse = {
  instances: {
    nodes: Instance[];
  };
}

export default InstanceResponse;
