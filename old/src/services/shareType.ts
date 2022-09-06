import { FETCH_OPTIONS } from '@/constants';
import gqlShareTypes from '@/graphql/queries/shareTypes.gql';
import gqlNewShareType from '@/graphql/mutations/shareTypeCreate.gql';
import gqlUpdateShareType from '@/graphql/mutations/shareTypeUpdate.gql';
import gqlLinkShareType from '@/graphql/mutations/shareTypeLink.gql';
import gqlUnlinkShareType from '@/graphql/mutations/shareTypeUnlink.gql';
import gqlDeleteShareType from '@/graphql/mutations/shareTypeDelete.gql';
import gqlDividendPosting from '@/graphql/mutations/shareTypeDividend.gql';
import { query, mutate, mutateCustom } from './Apollo';

/**
 * Options used to fetch Share Types from the API.
 */
export interface FetchOptions {
  // A list of instances to use as a filter when returning Share Types
  instances?: number[];

  // The number of items to return
  first?: number;

  // A string pointer to tell the server where to start returning Share Types
  after?: string;

  // True if the cache should be used, or to force a network call
  cache?: boolean;
}

/**
 * Get Share Types available to the current user, or optionally filtered by instance.
 *
 * @param options
 * @returns A promise containing a list of Share Type objects.
 * @throws {Error} If an error occurred during the network call.
 */
export async function getShareTypes(options?: FetchOptions): Promise<PagedShareTypeResponse> {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<PagedShareTypeResponse>(gqlShareTypes, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Create a new share type and return it from the server.
 *
 * @param input
 * @returns A promise containing the newly created Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function newShareType(input: NewShareTypeRequest): Promise<NewShareTypeResponse> {
  return mutate<NewShareTypeResponse>(gqlNewShareType, input);
}

/**
 * Update a Share Type and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateShareType(input: UpdateShareTypeRequest): Promise<UpdateShareTypeResponse> {
  return mutate<UpdateShareTypeResponse>(gqlUpdateShareType, input);
}

/**
 * Link a Share Type to an instance and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function linkShareType(input: LinkUnlinkShareTypeRequest): Promise<LinkShareTypeResponse> {
  return mutateCustom<LinkShareTypeResponse>({
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
export async function unlinkShareType(input: LinkUnlinkShareTypeRequest): Promise<UnlinkShareTypeResponse> {
  return mutateCustom<UnlinkShareTypeResponse>({
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
export async function deleteShareType(shareType: ShareType): Promise<DeleteShareTypeResponse> {
  return mutateCustom<DeleteShareTypeResponse>({
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
export async function postDividends(input: DividendPostingRequest): Promise<DividendPostingResponse> {
  return mutate<DividendPostingResponse>(gqlDividendPosting, input);
}
