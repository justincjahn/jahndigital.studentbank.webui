import gqlNewShare from '@/modules/admin/graphql/mutations/shareCreate.gql';
import gqlDeleteShare from '@/modules/admin/graphql/mutations/shareDelete.gql';
import gqlSharesByStudentId from '../graphql/queries/sharesByStudentId.gql';
import { query, mutate } from './Apollo';

export interface FetchOptions {
  cache?: boolean;
  first?: number;
  after?: string;
}

export interface FetchOptionsByStudentId extends FetchOptions {
  studentId: number;
}

/**
 * Get a list of shares associated with the provided Student ID.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export function getSharesByStudentId(options: FetchOptionsByStudentId) {
  const opts = {
    cache: true,
    ...options,
  };

  return query<PagedShareResponse>(gqlSharesByStudentId, opts, opts.cache ? 'cache-first' : 'network-only');
}

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
