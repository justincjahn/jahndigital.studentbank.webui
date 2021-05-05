import gqlGroups from '@/modules/admin/graphql/queries/groupsByInstance.gql';
import gqlNewGroup from '@/modules/admin/graphql/mutations/groupCreate.gql';
import gqlUpdateGroup from '@/modules/admin/graphql/mutations/groupUpdate.gql';
import gqlDeleteGroup from '@/modules/admin/graphql/mutations/groupDelete.gql';
import { query, mutateCustom } from './Apollo';

export interface FetchOptions {
  cache?: boolean;
  instanceId: number;
}

/**
 * Get a list of groups from the server.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getGroups(options: FetchOptions) {
  const opts = {
    cache: true,
    ...options,
  };

  return query<GroupResponse>(gqlGroups, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Create a new group and return the object from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function newGroup(input: NewGroupRequest) {
  return mutateCustom<NewGroupResponse>({
    mutation: gqlNewGroup,
    variables: input,
    refetchQueries: [{
      query: gqlGroups,
      variables: {
        instanceId: input.instanceId,
      },
    }],
  });
}

/**
 * Update a group and return the updated object from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateGroup(input: UpdateGroupRequest) {
  return mutateCustom<UpdateGroupResponse>({
    mutation: gqlUpdateGroup,
    variables: input,
    refetchQueries: [{
      query: gqlGroups,
      variables: {
        instanceId: input.instanceId,
      },
    }],
  });
}

/**
 * Soft-delete a group.
 *
 * @param group
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function deleteGroup(group: Group) {
  return mutateCustom<DeleteGroupResponse>({
    mutation: gqlDeleteGroup,
    variables: { id: group.id },
    refetchQueries: [{
      query: gqlGroups,
      variables: {
        instanceId: group.instanceId,
      },
    }],
  });
}
