import type {
  ShareTypesQuery,
  ShareTypesQueryVariables,
  NewShareTypeMutation,
  NewShareTypeMutationVariables,
  UpdateShareTypeMutation,
  UpdateShareTypeMutationVariables,
  LinkShareTypeMutation,
  LinkShareTypeMutationVariables,
  UnlinkShareTypeMutation,
  UnlinkShareTypeMutationVariables,
  DeleteShareTypeMutation,
  PostDividendsMutation,
  PostDividendsMutationVariables,
} from '@/generated/graphql';

import { query, mutate, mutateCustom } from '@/common/services/apollo';

// Utils
import { FETCH_OPTIONS } from '@/common/constants';

// Graphql
import gqlShareTypes from '@/graphql/queries/shareTypes.gql';
import gqlNewShareType from '@/graphql/mutations/shareTypeCreate.gql';
import gqlUpdateShareType from '@/graphql/mutations/shareTypeUpdate.gql';
import gqlLinkShareType from '@/graphql/mutations/shareTypeLink.gql';
import gqlUnlinkShareType from '@/graphql/mutations/shareTypeUnlink.gql';
import gqlDeleteShareType from '@/graphql/mutations/shareTypeDelete.gql';
import gqlDividendPosting from '@/graphql/mutations/shareTypeDividend.gql';

/**
 * Options used to fetch Share Types from the API.
 */
export interface FetchOptions extends ShareTypesQueryVariables {
  // True if the cache should be used, or to force a network call
  cache?: boolean;
}

export type ShareTypesResponse = Extract<
  ShareTypesQuery['shareTypes'],
  { __typename?: 'ShareTypesConnection' }
>;

export type ShareTypeNodes = Extract<
  ShareTypesResponse['nodes'],
  Array<{ __typename?: 'ShareType' }>
>;

export type ShareType = ShareTypeNodes[number];

/**
 * Get Share Types available to the current user, or optionally filtered by instance.
 *
 * @param options
 * @returns A promise containing a list of Share Type objects.
 * @throws {Error} If an error occurred during the network call.
 */
export async function getShareTypes(
  options?: FetchOptions
): Promise<ShareTypesQuery> {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<ShareTypesQuery>(
    gqlShareTypes,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Create a new share type and return it from the server.
 *
 * @param input
 * @returns A promise containing the newly created Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function newShareType(
  input: NewShareTypeMutationVariables
): Promise<NewShareTypeMutation> {
  return mutate<NewShareTypeMutation>(gqlNewShareType, input);
}

/**
 * Update a Share Type and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateShareType(
  input: UpdateShareTypeMutationVariables
): Promise<UpdateShareTypeMutation> {
  return mutate<UpdateShareTypeMutation>(gqlUpdateShareType, input);
}

/**
 * Link a Share Type to an instance and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function linkShareType(
  input: LinkShareTypeMutationVariables
): Promise<LinkShareTypeMutation> {
  return mutateCustom<LinkShareTypeMutation>({
    mutation: gqlLinkShareType,
    variables: input,
    update(cache) {
      cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'shareTypes',
      });

      cache.gc();
    },
  });
}

/**
 * Unlink a share type from an instance and return the updated Share Type.
 *
 * @param input
 * @returns A promise containing a Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function unlinkShareType(
  input: UnlinkShareTypeMutationVariables
): Promise<UnlinkShareTypeMutation> {
  return mutateCustom<UnlinkShareTypeMutation>({
    mutation: gqlUnlinkShareType,
    variables: input,
    update(cache) {
      cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'shareTypes',
      });

      cache.gc();
    },
  });
}

/**
 * Soft-delete a Share Type.
 *
 * @param input
 * @returns True if the Share Type was deleted.
 */
export async function deleteShareType(
  shareType: ShareType
): Promise<DeleteShareTypeMutation> {
  return mutateCustom<DeleteShareTypeMutation>({
    mutation: gqlDeleteShareType,
    variables: { id: shareType.id },
    update(cache) {
      cache.evict({
        id: cache.identify({ ...shareType }),
      });
    },
  });
}

/**
 * Post dividends for the provided Share Type ID
 *
 * @param input
 * @returns True if dividends were posted successfully.
 */
export async function postDividends(
  input: PostDividendsMutationVariables
): Promise<PostDividendsMutation> {
  return mutate<PostDividendsMutation>(gqlDividendPosting, input);
}
