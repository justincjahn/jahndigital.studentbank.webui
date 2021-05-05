import { FETCH_OPTIONS } from '@/constants';
import gqlAvailableShareTypes from '@/modules/admin/graphql/queries/shareTypesAvailable.gql';
import gqlShareTypesByInstance from '@/modules/admin/graphql/queries/shareTypesByInstance.gql';
import gqlNewShareType from '@/modules/admin/graphql/mutations/shareTypeCreate.gql';
import gqlUpdateShareType from '@/modules/admin/graphql/mutations/shareTypeUpdate.gql';
import gqlLinkShareType from '@/modules/admin/graphql/mutations/shareTypeLink.gql';
import gqlUnlinkShareType from '@/modules/admin/graphql/mutations/shareTypeUnlink.gql';
import gqlDeleteShareType from '@/modules/admin/graphql/mutations/shareTypeDelete.gql';
import gqlDividendPosting from '@/modules/admin/graphql/mutations/shareTypeDividend.gql';
import { query, mutate, mutateCustom } from './Apollo';

export interface FetchOptions {
  first?: number;
  cache?: boolean;
}

export interface InstanceFetchOptions extends FetchOptions {
  instanceId: number;
}

/**
 * Get all Share Types available to the current user.
 *
 * @param options
 * @returns A promise containing a list of Share Type objects.
 * @throws {Error} If an error occurred during the network call.
 */
export async function getAvailableShareTypes(options?: FetchOptions) {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<PagedAvailableShareTypeResponse>(gqlAvailableShareTypes, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Get all Share Types linked to the provided instance.
 *
 * @param options
 * @returns A promise containing a list of Share Type objects.
 * @throws {Error} If an error occurred during the network call.
 */
export async function getShareTypesByInstance(options: InstanceFetchOptions) {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<PagedShareTypeResponse>(gqlShareTypesByInstance, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Create a new share type and return it from the server.
 *
 * @param input
 * @returns A promise containing the newly created Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function newShareType(input: NewShareTypeRequest) {
  return mutate<NewShareTypeResponse>(gqlNewShareType, input);
}

/**
 * Update a Share Type and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateShareType(input: UpdateShareTypeRequest) {
  return mutate<UpdateShareTypeResponse>(gqlUpdateShareType, input);
}

/**
 * Link a Share Type to an instance and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Share Type.
 * @throws {Error} If an error occurred during the network call.
 */
export async function linkShareType(input: LinkUnlinkShareTypeRequest) {
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
export async function unlinkShareType(input: LinkUnlinkShareTypeRequest) {
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
export async function deleteShareType(shareType: ShareType) {
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
 * @returns True if dividends were posted succesfully.
 */
export async function postDividends(input: DividendPostingRequest) {
  return mutate<DividendPostingResponse>(gqlDividendPosting, input);
}
