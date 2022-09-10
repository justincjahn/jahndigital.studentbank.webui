import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  DocumentNode,
  InMemoryCache,
  FetchPolicy,
  MutationOptions,
  OperationVariables,
  QueryOptions,
} from '@apollo/client/core';

import { setContext } from '@apollo/client/link/context';
import { ERROR_CODES, API_ENDPOINT } from '@/common/constants';
import tokenStore from '@/common/stores/token';
import TokenRefreshService from './TokenRefreshService';

// Inject authentication headers into every query sent to the server.
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    Authorization: tokenStore.token.value
      ? `Bearer ${tokenStore.token.value}`
      : '',
  },
}));

// The Apollo HTTP Link to use when querying the server.
const httpLink = createHttpLink({
  uri: API_ENDPOINT,

  // Required for authentication to work across multiple origins
  credentials: 'include',
});

// The default Apollo client used by services.
const defaultClient = new ApolloClient({
  // @note Ordering is important here
  link: ApolloLink.from([new TokenRefreshService(), authLink, httpLink]),
  cache: new InMemoryCache(),
});

/**
 * Convenience method to call Apollo queries or reject if no data was returned.
 *
 * @param qry The GraphQL DocumentNode to send to the server.
 * @param variables The variables, if any, to send to the server for the provided query.
 * @returns The server result, or a rejected promise.
 */
export async function query<TReturn, TOptions = OperationVariables>(
  qry: DocumentNode,
  variables?: QueryOptions<TOptions, TReturn>,
  fetchPolicy?: FetchPolicy
): Promise<TReturn> {
  const res = await defaultClient.query<TReturn>({
    query: qry,
    variables,
    fetchPolicy,
  });

  if (res.data) return res.data;
  throw new Error(ERROR_CODES.UNKNOWN_ERROR);
}

/**
 * Convenience method to call Apollo queries or reject if no data was returned.
 *
 * @param options
 * @returns The server result, or a rejected promise.
 */
export async function mutateCustom<TReturn, TVariables = OperationVariables>(
  options: MutationOptions<TReturn, TVariables>
): Promise<TReturn> {
  const res = await defaultClient.mutate<TReturn, TVariables>(options);
  if (res.data) return res.data;
  throw new Error(ERROR_CODES.UNKNOWN_ERROR);
}

/**
 * Convenience method to call Apollo mutations or reject if no data was returned.
 *
 * @param mutation The GraphQL DocumentNode to send to the server.
 * @param variables The variables, if any, to send to the server.
 * @returns An Apollo result object of the TReturn type.
 */
export async function mutate<TReturn, TOptions = OperationVariables>(
  mutation: DocumentNode,
  variables?: TOptions
): Promise<TReturn> {
  return mutateCustom<TReturn, TOptions>({ mutation, variables });
}

export default defaultClient;
