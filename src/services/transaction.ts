import { FETCH_OPTIONS } from '@/constants';
import gqlTransactions from '@/modules/admin/graphql/queries/transactionsByShare.gql';
import gqlNewTransaction from '@/modules/admin/graphql/mutations/transactionCreate.gql';
import gqlNewBulkTransaction from '@/modules/admin/graphql/mutations/transactionBulk.gql';
import { query, mutate } from './Apollo';

export interface FetchOptions {
  // The Share ID for which to fetch transactions
  shareId: number;

  // The number of Transactions to return
  first?: number;

  // The pointer to continue the fetch from
  after?: string;

  // If items should be fetched from cache, if available, or force network
  cache?: boolean;
}

/**
 * Retrieve a list of transactions for the provided Share ID from the server.
 *
 * @param options
 * @returns A promise containing a list of transactions.
 * @throws {Error} If an error occurred during the network call.
 */
export function getTransactions(options: FetchOptions) {
  const opts = {
    first: FETCH_OPTIONS,
    cache: true,
    ...options,
  };

  return query<PagedTransactionResponse>(gqlTransactions, options, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Post a new transaction to the server.
 *
 * @param input
 * @returns A promise containing the posted transactions.
 * @throws {Error} If an error occurred during the network call.
 */
export function newTransaction(input: NewTransactionRequest) {
  return mutate<NewTransactionResponse>(gqlNewTransaction, input);
}

/**
 * Post a set of transactions to the server.
 *
 * @param input
 * @returns A promise containing the list of transactions that were posted.
 * @throws {Error} If an error occurred during the network call.
 */
export function newBulkTransaction(input: NewBulkTransactionRequest) {
  return mutate<NewBulkTransactionResponse>(gqlNewBulkTransaction, input);
}
