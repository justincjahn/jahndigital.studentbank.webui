import type {
  TransactionsQuery,
  TransactionsQueryVariables,
  NewTransactionMutation,
  NewTransactionMutationVariables,
  NewBulkTransactionMutation,
  NewBulkTransactionMutationVariables,
  NewTransferMutation,
  NewTransferMutationVariables,
  NewStockPurchaseMutation,
  NewStockPurchaseMutationVariables,
} from '@/generated/graphql';

// Services
import { query, mutate } from '@/common/services/apollo';

// Utils
import { FETCH_OPTIONS } from '@/common/constants';

// GraphQL
import gqlTransactions from '@/common/graphql/queries/transactionsByShare.gql';
import gqlNewTransaction from '@/common/graphql/mutations/transactionCreate.gql';
import gqlNewBulkTransaction from '@/common/graphql/mutations/transactionBulk.gql';
import gqlTransactionTransfer from '@/common/graphql/mutations/transactionTransfer.gql';
import gqlNewStockPurchase from '@/common/graphql/mutations/newStockPurchase.gql';

export type { NewTransactionRequestInput } from '@/generated/graphql';

export interface TransactionFetchOptions extends TransactionsQueryVariables {
  // If items should be fetched from cache, if available, or force network
  cache?: boolean;
}

export type TransactionResponse = Extract<
  TransactionsQuery['transactions'],
  { __typename?: 'TransactionsConnection' }
>;

export type TransactionNodes = Extract<
  TransactionResponse['nodes'],
  Array<{ __typename?: 'Transaction' }>
>;

export type Transaction = TransactionNodes[number];

/**
 * Retrieve a list of transactions for the provided Share ID from the server.
 *
 * @param options
 * @returns A promise containing a list of transactions.
 * @throws {Error} If an error occurred during the network call.
 */
export function getTransactions(
  options: TransactionFetchOptions
): Promise<TransactionsQuery> {
  const opts = {
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    cache: true,
    ...options,
  };

  return query<TransactionsQuery, TransactionsQueryVariables>(
    gqlTransactions,
    options,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Post a new transaction to the server.
 *
 * @param input
 * @returns A promise containing the posted transactions.
 * @throws {Error} If an error occurred during the network call.
 */
export function newTransaction(
  input: NewTransactionMutationVariables
): Promise<NewTransactionMutation> {
  return mutate<NewTransactionMutation, NewTransactionMutationVariables>(
    gqlNewTransaction,
    input
  );
}

/**
 * Post a set of transactions to the server.
 *
 * @param input
 * @returns A promise containing the list of transactions that were posted.
 * @throws {Error} If an error occurred during the network call.
 */
export function newBulkTransaction(
  input: NewBulkTransactionMutationVariables
): Promise<NewBulkTransactionMutation> {
  return mutate<
    NewBulkTransactionMutation,
    NewBulkTransactionMutationVariables
  >(gqlNewBulkTransaction, input);
}

/**
 * Transfer funds from one share to another.
 *
 * @param input
 * @returns A promise containing the two posted transactions.
 * @throws {Error} If an error occurred during the network call.
 */
export function newTransfer(
  input: NewTransferMutationVariables
): Promise<NewTransferMutation> {
  return mutate<NewTransferMutation, NewTransferMutationVariables>(
    gqlTransactionTransfer,
    input
  );
}

/**
 * Buy or sell stocks.
 *
 * @param input
 * @returns A promise containing the new StudentStock object.
 * @throws {Error} If an error occurred during the network call.
 */
export function newStockPurchase(
  input: NewStockPurchaseMutationVariables
): Promise<NewStockPurchaseMutation> {
  return mutate<NewStockPurchaseMutation, NewStockPurchaseMutationVariables>(
    gqlNewStockPurchase,
    input
  );
}
