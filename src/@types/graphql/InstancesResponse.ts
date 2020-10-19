import Instance from '../Instance';

type InstanceResponse = {
  instances: {
    nodes: Instance[];
  };
}

export default InstanceResponse;
