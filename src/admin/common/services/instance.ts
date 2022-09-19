import type {
  AllInstancesQuery,
  NewInstanceMutation,
  NewInstanceMutationVariables,
  UpdateInstanceMutation,
  UpdateInstanceMutationVariables,
  DeleteInstanceMutation,
  DeleteGroupMutationVariables,
} from '@/generated/graphql';

import gqlInstances from '@/common/graphql/queries/instances.gql';
import gqlNewInstance from '@/common/graphql/mutations/instanceCreate.gql';
import gqlUpdateInstance from '@/common/graphql/mutations/instanceUpdate.gql';
import gqlDeleteInstance from '@/common/graphql/mutations/instanceDelete.gql';
import { query, mutateCustom } from '@/common/services/apollo';

export type InstanceResponse = Extract<
  AllInstancesQuery['instances'],
  { __typename?: 'InstancesConnection' | undefined }
>;

export type InstanceNodes = Extract<
  InstanceResponse['nodes'],
  Array<{ __typename?: 'Instance' | undefined }>
>;

export type Instance = InstanceNodes[number];

/**
 * Retrieve a list of instances from the server.
 *
 * @param cache Pull data from cache, if available, or force fetch from the network.
 * @returns A promise containing a list of instances.
 * @throws {Error} If an error occurred during the network call.
 */
export async function getInstances(cache = true): Promise<AllInstancesQuery> {
  return query<AllInstancesQuery>(
    gqlInstances,
    undefined,
    cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Create a new Instance and return it from the server.
 *
 * @param input
 * @returns A promise containing the newly created instance.
 * @throws {Error} If an error occurred during the network call.
 */
export async function newInstance(
  input: NewInstanceMutationVariables
): Promise<NewInstanceMutation> {
  return mutateCustom<NewInstanceMutation>({
    mutation: gqlNewInstance,
    variables: input,
    refetchQueries: [
      {
        query: gqlInstances,
      },
    ],
  });
}

/**
 * Update an instance and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated instance.
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateInstance(
  input: UpdateInstanceMutationVariables
): Promise<UpdateInstanceMutation> {
  return mutateCustom<UpdateInstanceMutation>({
    mutation: gqlUpdateInstance,
    variables: input,
    refetchQueries: [
      {
        query: gqlInstances,
      },
    ],
  });
}

/**
 * Soft-delete an Instance object.
 *
 * @param input
 * @returns True if the object was deleted.
 * @throws {Error} If an error occurred during the network call.
 */
export async function deleteInstance(
  input: DeleteGroupMutationVariables
): Promise<DeleteInstanceMutation> {
  return mutateCustom<DeleteInstanceMutation>({
    mutation: gqlDeleteInstance,
    variables: input,
    refetchQueries: [
      {
        query: gqlInstances,
      },
    ],
  });
}
