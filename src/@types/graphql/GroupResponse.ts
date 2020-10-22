import Group from '../Group';

/**
 * GraphQL response when querying for groups.
 */
type GroupResponse = {
  groups: {
    nodes: Group[];
  };
}

export default GroupResponse;
