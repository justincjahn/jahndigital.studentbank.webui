import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  DocumentNode,
  InMemoryCache,
  FetchPolicy,
  MutationOptions,
  OperationVariables,
} from '@apollo/client/core';

import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { ERROR_CODES, API_ENDPOINT } from '@/constants';

// Stores
import userStore from '../stores/user';

// Services
import TokenRefreshService from './TokenRefreshService';

/**
 * Extra logging for failed requests.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorLink = onError(({ networkError, graphQLErrors }: any) => {
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    if (networkError.statusCode === 500) {
      console.error('Internal Server Error');
    }
  }

  if (graphQLErrors) {
    let code = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphQLErrors.map((request: any): void => {
      const {
        message,
        locations,
        path,
        extensions,
      } = request;

      if (extensions && typeof extensions.code !== 'undefined') {
        code = extensions.code;
      }

      return console.error(
        `[GraphQL error]: Message: ${message ?? 'unknown error'}, Path: ${path ?? 'N/A'}, Code: ${extensions?.code ?? 'N/A'}`,
        locations,
      );
    });

    if (code === ERROR_CODES.NOT_AUTHORIZED) {
      console.log('Unauthorized');
    }

    if (code === ERROR_CODES.NOT_AUTHENTICATED) {
      console.log('Not logged in.');
    }
  }
});

/**
 * Inject authentication headers into every query sent to the server.
 */
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    Authorization: userStore.jwtToken.value ? `Bearer ${userStore.jwtToken.value}` : '',
  },
}));

/**
 * The Apollo HTTP Link to use when querying the server.
 */
const httpLink = createHttpLink({
  uri: API_ENDPOINT,

  // Required for authentication to work across multiple origins
  credentials: 'include',
});

/**
 * The default Apollo client used by services.
 */
const defaultClient = new ApolloClient({
  // @note Ordering is important here
  link: ApolloLink.from([errorLink, new TokenRefreshService(), authLink, httpLink]),
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
  variables?: TOptions,
  fetchPolicy?: FetchPolicy,
): Promise<TReturn> {
  const res = await defaultClient.query<TReturn>({ query: qry, variables, fetchPolicy });
  if (res.data) return Promise.resolve(res.data);
  return Promise.reject(new Error('An unknown error has occurred.'));
}

/**
 * Convenience method to call Apollo queries or reject if no data was returned.
 *
 * @param options
 * @returns The server result, or a rejected promise.
 */
export async function mutateCustom<TReturn, TVariables = OperationVariables>(
  options: MutationOptions<TReturn, TVariables>,
): Promise<TReturn> {
  const res = await defaultClient.mutate<TReturn, TVariables>(options);
  if (res.data) return Promise.resolve(res.data);
  return Promise.reject(new Error('An unknown error has occurred.'));
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
  variables?: TOptions,
): Promise<TReturn> {
  return mutateCustom<TReturn, TOptions>({ mutation, variables });
}

export default defaultClient;
