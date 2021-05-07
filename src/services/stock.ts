import { FETCH_OPTIONS } from '@/constants';
import gqlStocksAvailable from '@/graphql/queries/stocksAvailable.gql';
import gqlStockHistory from '@/graphql/queries/stockHistory.gql';
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
interface FetchOptions {
  // The number of stock objects to fetch
  first?: number;

  // The pointer to continue the fetch from.
  after?: string;

  // If the cache can be used, or force a network call
  cache?: boolean;
}

export interface StockListOptions extends FetchOptions {
  // A list of instances to use as a filter when returning Share Types
  instances?: number[];
}

/**
 * Options used to determine what stock history will be fetched.
 */
export interface StockHistoryListOptions extends FetchOptions {
  stockId: number;
}

/**
 * Retrieve a list of stocks from the server.
 *
 * @param options
 * @returns A promise containing a list of stocks.
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStocks(options?: StockListOptions) {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    ...options,
  };

  return query<PagedStockResponse>(gqlStocksAvailable, opts);
}

/**
 * Retrieve a list of stock history for a specific stock from the server.
 *
 * @param options
 * @returns A promise containing a list of stock history.
 */
export async function getStockHistory(options: StockHistoryListOptions) {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<PagedStockHistoryResponse>(gqlStockHistory, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Create a new stock and return it from the server.
 *
 * @param input
 * @returns A promise containing the new Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function newStock(input: NewStockRequest) {
  return mutate<NewStockResponse>(gqlStockCreate, input);
}

/**
 * Update a stock and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateStock(input: UpdateStockRequest) {
  return mutate<UpdateStockResponse>(gqlStockUpdate, input);
}

/**
 * Link a Stock object to an instance.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function linkStock(input: LinkUnlinkStockRequest) {
  return mutate<LinkStockResponse>(gqlStockLink, input);
}

/**
 * Unlink a Stock object from an instance.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function unlinkStock(input: LinkUnlinkStockRequest) {
  return mutate<UnlinkStockResponse>(gqlStockUnlink, input);
}

/**
 * Soft-delete a Stock object.
 *
 * @param input
 * @returns True if the object was deleted.
 * @throws {Error} If an error occurred during the network call.
 */
export async function deleteStock(input: DeleteRestoreStockRequest) {
  return mutate<DeleteStockResponse>(gqlStockDelete, input);
}

/**
 * Restore a soft-deleted Stock object.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function restoreStock(input: DeleteRestoreStockRequest) {
  return mutate<RestoreStockResponse>(gqlStockRestore, input);
}
