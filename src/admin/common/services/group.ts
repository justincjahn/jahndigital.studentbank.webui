import type {
  GroupsByInstanceQuery,
  GroupsByInstanceQueryVariables,
  NewGroupMutation,
  NewGroupMutationVariables,
  UpdateGroupMutation,
  UpdateGroupMutationVariables,
  DeleteGroupMutation,
  GroupStatisticsQuery,
  GroupStatisticsQueryVariables,
  StudentsByGroupsQuery,
  StudentsByGroupsQueryVariables,
} from '@/generated/graphql';

import gqlGroups from '@/common/graphql/queries/groupsByInstance.gql';
import gqlNewGroup from '@/common/graphql/mutations/groupCreate.gql';
import gqlUpdateGroup from '@/common/graphql/mutations/groupUpdate.gql';
import gqlDeleteGroup from '@/common/graphql/mutations/groupDelete.gql';
import gqlGroupStatistics from '@/common/graphql/queries/groupStatistics.gql';
import gqlStudentsByGroups from '@/common/graphql/queries/studentsByGroups.gql';
import { query, mutateCustom } from '@/common/services/apollo';

/**
 * A JSON response returned by the backend when querying for groups.
 */
export type GroupResponse = Extract<
  GroupsByInstanceQuery['groups'],
  { __typename?: 'GroupsConnection' | undefined }
>;

/**
 * A paginated list of Group objects returned by the backend.
 */
export type GroupNodes = Extract<
  GroupResponse['nodes'],
  Array<{ __typename?: 'Group' | undefined }>
>;

/**
 * A Group object returned by the backend.
 */
export type Group = GroupNodes[number];

/**
 * A request to add a new group to the backend.
 */
export type NewGroupRequest = NewGroupMutationVariables;

/**
 * A request to update a group on the backend.
 */
export interface UpdateGroupRequest extends UpdateGroupMutationVariables {
  instanceId: number;
}

/**
 * The options used to fetch groups
 */
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
export async function getGroups(
  options: FetchOptions
): Promise<GroupsByInstanceQuery> {
  const opts = {
    cache: true,
    ...options,
  };

  return query<GroupsByInstanceQuery, GroupsByInstanceQueryVariables>(
    gqlGroups,
    {
      instanceId: options.instanceId,
    },
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Create a new group and return the object from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function newGroup(
  input: NewGroupRequest
): Promise<NewGroupMutation> {
  return mutateCustom<NewGroupMutation>({
    mutation: gqlNewGroup,
    variables: input,
    refetchQueries: [
      {
        query: gqlGroups,
        variables: {
          instanceId: input.instanceId,
        },
      },
    ],
  });
}

/**
 * Update a group and return the updated object from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateGroup(
  input: UpdateGroupRequest
): Promise<UpdateGroupMutation> {
  return mutateCustom<UpdateGroupMutation>({
    mutation: gqlUpdateGroup,
    variables: input,
    refetchQueries: [
      {
        query: gqlGroups,
        variables: {
          instanceId: input.instanceId,
        },
      },
    ],
  });
}

/**
 * Soft-delete a group.
 *
 * @param group
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function deleteGroup(group: Group): Promise<DeleteGroupMutation> {
  return mutateCustom<DeleteGroupMutation>({
    mutation: gqlDeleteGroup,
    variables: { id: group.id },
    refetchQueries: [
      {
        query: gqlGroups,
        variables: {
          instanceId: group.instanceId,
        },
      },
    ],
  });
}

/**
 * Fetch statistics for the provided groups.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function groupStatistics(
  input: GroupStatisticsQueryVariables
): Promise<GroupStatisticsQuery> {
  return query<GroupStatisticsQuery>(gqlGroupStatistics, input, 'no-cache');
}

/**
 * Fetch student details for the provided groups.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function studentsByGroups(
  input: StudentsByGroupsQueryVariables
): Promise<StudentsByGroupsQuery> {
  return query<StudentsByGroupsQuery>(gqlStudentsByGroups, input, 'no-cache');
}
