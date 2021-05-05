import gqlStocksAvailable from '@/graphql/queries/stocksAvailable.gql';
import gqlStockCreate from '@/modules/admin/graphql/mutations/stockCreate.gql';
import gqlStockUpdate from '@/modules/admin/graphql/mutations/stockUpdate.gql';
import gqlStockLink from '@/modules/admin/graphql/mutations/stockLink.gql';
import gqlStockUnlink from '@/modules/admin/graphql/mutations/stockUnlink.gql';
import gqlStockDelete from '@/modules/admin/graphql/mutations/stockDelete.gql';
import gqlStockRestore from '@/modules/admin/graphql/mutations/stockRestore.gql';
import { query, mutate } from './Apollo';

/**
 * Options used to determine what stocks will be fetched.
 */
export interface ShareListOptions {
  // The number of stock objects to fetch
  first?: number;

  // The pointer to continue the fetch from.
  after?: string;
}

/**
 * Retrieve a list of stocks from the server.
 *
 * @param options
 * @returns A promise containing a list of stocks.
 * @throws {Error} If an error occurred during the network call.
 */
export async function GetStocks(options?: ShareListOptions) {
  const opts: ShareListOptions = {
    first: 25,
    ...options,
  };

  return query<PagedStockResponse>(gqlStocksAvailable, opts);
}

/**
 * Create a new stock and return it from the server.
 *
 * @param input
 * @returns A promise containing the new Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function NewStock(input: NewStockRequest) {
  return mutate<NewStockResponse>(gqlStockCreate, input);
}

/**
 * Update a stock and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function UpdateStock(input: UpdateStockRequest) {
  return mutate<UpdateStockResponse>(gqlStockUpdate, input);
}

/**
 * Link a Stock object to an instance.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function LinkStock(input: LinkUnlinkStockRequest) {
  return mutate<LinkStockResponse>(gqlStockLink, input);
}

/**
 * Unlink a Stock object from an instance.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function UnlinkStock(input: LinkUnlinkStockRequest) {
  return mutate<UnlinkStockResponse>(gqlStockUnlink, input);
}

/**
 * Soft-delete a Stock object.
 *
 * @param input
 * @returns True if the object was deleted.
 * @throws {Error} If an error occurred during the network call.
 */
export async function DeleteStock(input: DeleteRestoreStockRequest) {
  return mutate<DeleteStockResponse>(gqlStockDelete, input);
}

/**
 * Restore a soft-deleted Stock object.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function RestoreStock(input: DeleteRestoreStockRequest) {
  return mutate<RestoreStockResponse>(gqlStockRestore, input);
}
