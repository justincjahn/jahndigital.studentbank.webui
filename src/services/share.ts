import gqlNewShare from '@/modules/admin/graphql/mutations/shareCreate.gql';
import gqlDeleteShare from '@/modules/admin/graphql/mutations/shareDelete.gql';
import { mutate } from './Apollo';

/**
 * Create a new Share and return it from the server.
 *
 * @param input
 * @returns A promise containing the newly created Share.
 * @throws {Error} If an error occurred during the network call.
 */
export function newShare(input: NewShareRequest) {
  return mutate<NewShareResponse>(gqlNewShare, input);
}

/**
 * Delete a Share from the server.
 *
 * @param input
 * @returns Response object that's true if the Share is deleted sucessfully.
 */
export function deleteShare(input: DeleteRestoreShareRequest) {
  return mutate<DeleteShareResponse>(gqlDeleteShare, input);
}
