import type {
  SharesByStudentIdQuery,
  SharesByStudentIdQueryVariables,
  NewShareMutation,
  NewShareMutationVariables,
  DeleteShareMutation,
  DeleteShareMutationVariables,
} from '@/generated/graphql';

import { query, mutate } from '@/common/services/apollo';

import gqlNewShare from '@/common/graphql/mutations/shareCreate.gql';
import gqlDeleteShare from '@/common/graphql/mutations/shareDelete.gql';
import gqlSharesByStudentId from '@/common/graphql/queries/sharesByStudentId.gql';

export interface FetchOptions extends SharesByStudentIdQueryVariables {
  cache?: boolean;
}

export type ShareResponse = Extract<
  SharesByStudentIdQuery['shares'],
  { __typename?: 'SharesConnection' }
>;

export type ShareNodes = Extract<
  ShareResponse['nodes'],
  Array<{ __typename?: 'Share' }>
>;

export type Share = ShareNodes[number];

/**
 * Get a list of shares associated with the provided Student ID.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export function getSharesByStudentId(
  options: FetchOptions
): Promise<SharesByStudentIdQuery> {
  const opts = {
    cache: true,
    ...options,
  };

  return query<SharesByStudentIdQuery>(
    gqlSharesByStudentId,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Create a new Share and return it from the server.
 *
 * @param input
 * @returns A promise containing the newly created Share.
 * @throws {Error} If an error occurred during the network call.
 */
export function newShare(
  input: NewShareMutationVariables
): Promise<NewShareMutation> {
  return mutate<NewShareMutation>(gqlNewShare, input);
}

/**
 * Delete a Share from the server.
 *
 * @param input
 * @returns Response object that's true if the Share is deleted successfully.
 */
export function deleteShare(
  input: DeleteShareMutationVariables
): Promise<DeleteShareMutation> {
  return mutate<DeleteShareMutation>(gqlDeleteShare, input);
}
