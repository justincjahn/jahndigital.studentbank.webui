import { FETCH_OPTIONS } from '@/constants';
import gqlStocksAvailable from '@/graphql/queries/stocksAvailable.gql';
import gqlStockHistory from '@/graphql/queries/stockHistory.gql';
import gqlStockCreate from '@/graphql/mutations/stockCreate.gql';
import gqlStockUpdate from '@/graphql/mutations/stockUpdate.gql';
import gqlStockLink from '@/graphql/mutations/stockLink.gql';
import gqlStockUnlink from '@/graphql/mutations/stockUnlink.gql';
import gqlStockDelete from '@/graphql/mutations/stockDelete.gql';
import gqlStockRestore from '@/graphql/mutations/stockRestore.gql';
import gqlStudentStocks from '@/graphql/queries/studentStocks.gql';
import gqlStudentStockHistory from '@/graphql/queries/studentStockHistory.gql';
import gqlStockHistoryPurge from '@/graphql/mutations/stockHistoryPurge.gql';
import { query, mutate, mutateCustom } from './Apollo';

/**
 * Options used to determine what stocks will be fetched.
 */
interface FetchOptionsBase {
  // The number of stock objects to fetch
  first?: number;

  // The pointer to continue the fetch from.
  after?: string;

  // If the cache can be used, or force a network call
  cache?: boolean;
}

/**
 * Options used to query for a list of stocks.
 */
export interface StockListOptions extends FetchOptionsBase {
  // A list of instances to use as a filter when returning Share Types
  instances?: number[];

  // A list of filters for optional searching
  where?: StockFilter;

  // Sort operation
  order?: StockSort;
}

/**
 * Options used to determine what stock history will be fetched.
 */
export interface StockHistoryListOptions extends FetchOptionsBase {
  stockId: number;
}

/**
 * Options used to determine what student's stock holdings will be fetched.
 */
export interface StudentStocksOptions extends FetchOptionsBase {
  studentId: number;

  where?: StudentStockFilter;
}

/**
 * Options used to determine what student stock purchase history will be fetched.
 */
export interface StudentStockHistoryOptions extends FetchOptionsBase {
  studentStockId: number;
}

/**
 * Retrieve a list of stocks from the server.
 *
 * @param options
 * @returns A promise containing a list of stocks.
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStocks(options?: StockListOptions): Promise<PagedStockResponse> {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<PagedStockResponse>(gqlStocksAvailable, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Retrieve a list of stock history for a specific stock from the server.
 *
 * @param options
 * @returns A promise containing a list of stock history.
 */
export async function getStockHistory(options: StockHistoryListOptions): Promise<PagedStockHistoryResponse> {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<PagedStockHistoryResponse>(gqlStockHistory, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Retrieve a list of stocks held by the provided student from the server.
 *
 * @param options
 * @returns A promise containing a list of stock history.
 */
export async function getStudentStocks(options: StudentStocksOptions): Promise<PagedStudentStockResponse> {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<PagedStudentStockResponse>(gqlStudentStocks, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Retrieve purchase history for a given student stock from the server.
 *
 * @param options
 * @returns A promise containing a list of a student's purchase history for the holding provided.
 */
export async function getStudentStockHistory(
  options: StudentStockHistoryOptions,
): Promise<PagedStudentStockHistoryResponse> {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: false,
    ...options,
  };

  return query<PagedStudentStockHistoryResponse>(gqlStudentStockHistory, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Create a new stock and return it from the server.
 *
 * @param input
 * @returns A promise containing the new Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function newStock(input: NewStockRequest): Promise<NewStockResponse> {
  return mutate<NewStockResponse>(gqlStockCreate, input);
}

/**
 * Update a stock and return it from the server.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateStock(input: UpdateStockRequest): Promise<UpdateStockResponse> {
  return mutate<UpdateStockResponse>(gqlStockUpdate, input);
}

/**
 * Link a Stock object to an instance.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function linkStock(input: LinkUnlinkStockRequest): Promise<LinkStockResponse> {
  return mutateCustom<LinkStockResponse>({
    mutation: gqlStockLink,
    variables: input,
    update(cache) {
      cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'stocks',
      });

      cache.gc();
    },
  });
}

/**
 * Unlink a Stock object from an instance.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function unlinkStock(input: LinkUnlinkStockRequest): Promise<UnlinkStockResponse> {
  return mutateCustom<UnlinkStockResponse>({
    mutation: gqlStockUnlink,
    variables: input,
    update(cache) {
      cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'stocks',
      });

      cache.gc();
    },
  });
}

/**
 * Soft-delete a Stock object.
 *
 * @param input
 * @returns True if the object was deleted.
 * @throws {Error} If an error occurred during the network call.
 */
export async function deleteStock(stock: Stock): Promise<DeleteStockResponse> {
  return mutateCustom<DeleteStockResponse>({
    mutation: gqlStockDelete,
    variables: { id: stock.id },
    update(cache) {
      cache.evict({
        id: cache.identify({ ...stock }),
      });
    },
  });
}

/**
 * Purge a stock's history up to the provided date.
 *
 * @param input
 * @returns A promise containing an array of StockHistory objects that were purged.
 * @throws {Error} If an error occurred during the network call.
 */
export async function purgeStockHistory(input: PurgeStockHistoryRequest): Promise<PurgeStockHistoryResponse> {
  return mutateCustom<PurgeStockHistoryResponse>({
    mutation: gqlStockHistoryPurge,
    variables: input,
  });
}

/**
 * Restore a soft-deleted Stock object.
 *
 * @param input
 * @returns A promise containing the updated Stock object.
 * @throws {Error} If an error occurred during the network call.
 */
export async function restoreStock(input: DeleteRestoreStockRequest): Promise<RestoreStockResponse> {
  return mutate<RestoreStockResponse>(gqlStockRestore, input);
}
