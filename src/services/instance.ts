import gqlInstances from '@/graphql/queries/instances.gql';
import gqlNewInstance from '@/graphql/mutations/instanceCreate.gql';
import gqlUpdateInstance from '@/graphql/mutations/instanceUpdate.gql';
import gqlDeleteInstance from '@/graphql/mutations/instanceDelete.gql';
import { query, mutateCustom } from './Apollo';

/**
 * Retrieve a list of instances from the server.
 *
 * @param cache Pull data from cache, if available, or force fetch from the network.
 * @returns A promise containing a list of instances.
 * @throws {Error} If an error occurred during the network call.
 */
export async function getInstances(cache = true) {
  return query<InstanceResponse>(gqlInstances, undefined, cache ? 'cache-first' : 'network-only');
}

/**
 * Create a new Instance and return it from the server.
 *
 * @param input
 * @returns A promise containing the newly created instance.
 * @throws {Error} If an error occurred during the network call.
 */
export async function newInstance(input: NewInstanceRequest) {
  return mutateCustom<NewInstanceResponse>({
    mutation: gqlNewInstance,
    variables: input,
    refetchQueries: [{
      query: gqlInstances,
    }],
  });
}

/**
 * Update an instance and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated instance.
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateInstance(input: UpdateInstanceRequest) {
  return mutateCustom<UpdateInstanceResponse>({
    mutation: gqlUpdateInstance,
    variables: input,
    refetchQueries: [{
      query: gqlInstances,
    }],
  });
}

/**
 * Soft-delete an Instance object.
 *
 * @param input
 * @returns True if the object was deleted.
 * @throws {Error} If an error occurred during the network call.
 */
export async function deleteInstance(input: DeleteRestoreInstanceRequest) {
  return mutateCustom<DeleteInstanceResponse>({
    mutation: gqlDeleteInstance,
    variables: input,
    refetchQueries: [{
      query: gqlInstances,
    }],
  });
}
