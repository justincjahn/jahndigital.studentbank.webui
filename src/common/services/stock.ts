import type {
  StocksQuery,
  StocksQueryVariables,
  NewStockMutation,
  NewStockMutationVariables,
  UpdateStockMutation,
  UpdateStockMutationVariables,
  LinkStockMutation,
  LinkStockMutationVariables,
  UnlinkStockMutation,
  UnlinkStockMutationVariables,
  DeleteStockMutation,
  PurgeStockHistoryMutation,
  PurgeStockHistoryMutationVariables,
} from '@/generated/graphql';

import { query, mutate, mutateCustom } from '@/common/services/apollo';

import gqlStocks from '@/common/graphql/queries/stocks.gql';
import gqlNewStock from '@/common/graphql/mutations/stockCreate.gql';
import gqlUpdateStock from '@/common/graphql/mutations/stockUpdate.gql';
import gqlLinkStock from '@/common/graphql/mutations/stockLink.gql';
import gqlUnlinkStock from '@/common/graphql/mutations/stockUnlink.gql';
import gqlDeleteStock from '@/common/graphql/mutations/stockDelete.gql';
import gqlPurgeHistory from '@/common/graphql/mutations/stockHistoryPurge.gql';

type QueryBaseOptions = Omit<StocksQueryVariables, 'instances'>;

export interface FetchOptionsBase extends QueryBaseOptions {
  cache?: boolean;
}

export interface GetByInstanceFetchOptions extends StocksQueryVariables {
  cache?: boolean;
}

export interface GetBySymbolOptions extends FetchOptionsBase {
  symbol: string;
}

export type StockResponse = Extract<
  StocksQuery['stocks'],
  { __typename?: 'StocksConnection' }
>;

export type StockNodes = Extract<
  StockResponse['nodes'],
  Array<{ __typename?: 'Stock' }>
>;

export type Stock = StockNodes[number];

/**
 * Get a list of stocks available or associated with one or more instances,
 * if provided.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export function getStocks(
  options?: GetByInstanceFetchOptions
): Promise<StocksQuery> {
  const opts = {
    cache: true,
    ...options,
  };

  return query<StocksQuery>(
    gqlStocks,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Get a stock by it's symbol.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStockBySymbol(
  options: GetBySymbolOptions
): Promise<Stock | null> {
  const opts = {
    cache: true,
    ...options,
  };

  opts.where = {
    symbol: {
      eq: options.symbol,
    },
  };

  const data = await query<StocksQuery>(
    gqlStocks,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );

  if (!data.stocks?.nodes) {
    throw new Error('An unknown error ocurred during fetch.');
  }

  return data.stocks?.nodes[0] ?? null;
}

/**
 * Create a new Stock and return it from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export function newStock(
  input: NewStockMutationVariables
): Promise<NewStockMutation> {
  return mutate<NewStockMutation>(gqlNewStock, input);
}

/**
 * Update a Stock and return it from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateStock(
  input: UpdateStockMutationVariables
): Promise<UpdateStockMutation> {
  return mutate<UpdateStockMutation>(gqlUpdateStock, input);
}

/**
 * Link a Stock to an instance.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function linkStock(
  input: LinkStockMutationVariables
): Promise<LinkStockMutation> {
  return mutateCustom<LinkStockMutation>({
    mutation: gqlLinkStock,
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
 * Unlink a Stock from an instance.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function unlinkStock(
  input: UnlinkStockMutationVariables
): Promise<UnlinkStockMutation> {
  return mutateCustom<UnlinkStockMutation>({
    mutation: gqlUnlinkStock,
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
 * Delete a stock from the server.
 *
 * @param stock
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export function deleteStock(stock: Stock): Promise<DeleteStockMutation> {
  return mutateCustom<DeleteStockMutation>({
    mutation: gqlDeleteStock,
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
 * @param stock The stock whose history to purge.
 * @param date A date in yyyy-mm-dd format.
 * @returns
 */
export function purgeStockHistory(
  stock: Stock,
  date: string
): Promise<PurgeStockHistoryMutation> {
  return mutate<PurgeStockHistoryMutation, PurgeStockHistoryMutationVariables>(
    gqlPurgeHistory,
    {
      stockId: stock.id,
      date,
    }
  );
}
