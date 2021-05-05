import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  DocumentNode,
  InMemoryCache,
  Operation,
  ServerParseError,
  throwServerError,
  FetchPolicy,
  MutationOptions,
  OperationVariables,
} from '@apollo/client/core';

import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import persistToken from '@/utils/persistToken';
import { TokenRefreshLink } from '@/utils/tokenRefreshLink';
import userStore from '@/store/user';
import { ERROR_CODES, API_ENDPOINT } from '@/constants';

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
 * Automatically attempt to refresh the user's JWT token using the stored refresh token.
 */
const tokenLink = new TokenRefreshLink({
  accessTokenField: 'jwtToken',

  isTokenValidOrUndefined: () => {
    if (userStore.jwtToken.value === null) return true;
    if (!userStore.isAuthenticated.value) return false;
    if (userStore.tokenExpiration.value < Date.now()) return false;
    return true;
  },

  fetchAccessToken: (): Promise<Response> => {
    // Instead of using Apollo to fetch the refresh tokens, we use the fetch API because
    // cyclic dependencies... and also the TokenRefreshLink doesn't support it.
    // @note Refresh tokens are stored in an HttpOnly cookie.
    let body = `
      mutation userRefreshToken {
        userRefreshToken {
          id
          jwtToken
        }
      }
    `;

    let operation = 'userRefreshToken';

    if (userStore.isStudent.value) {
      body = `
        mutation studentRefreshToken {
          studentRefreshToken {
            id
            jwtToken
          }
        }
      `;

      operation = 'studentRefreshToken';
    }

    return fetch(API_ENDPOINT, {
      method: 'POST',

      headers: {
        Accepts: 'application/json',
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        operationName: operation,
        query: body,
        variables: {},
      }),
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, arrow-body-style
  handleResponse: (operation: Operation, accessTokenField: string) => (response: Response) => {
    return response
      .text()
      .then((bodyText) => {
        if (typeof bodyText !== 'string' || !bodyText.length) {
          return bodyText || '';
        }

        try {
          return JSON.parse(bodyText);
        } catch (err) {
          const parseError = err as ServerParseError;
          parseError.response = response;
          parseError.statusCode = response.status;
          parseError.bodyText = bodyText;
          return Promise.reject(parseError);
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((parsedBody: Record<string, any>) => {
        if (response.status >= 300) {
          throwServerError(
            response,
            parsedBody,
            `Response not successful: Received status code ${response.status}`,
          );
        }

        if (parsedBody && parsedBody.data) {
          const data = parsedBody.data.userRefreshToken
            || parsedBody.data.studentRefreshToken || null;

          if (data == null || typeof data.jwtToken === 'undefined') {
            throwServerError(
              response,
              parsedBody,
              'Response not successful: no token returned.',
            );
          }

          return data;
        }

        return throwServerError(
          response,
          parsedBody,
          'Response not successful: no token returned.',
        );
      });
  },

  handleFetch: (accessToken) => {
    persistToken(accessToken);
  },

  handleError: (err) => {
    console.warn('Your refresh token is invalid. Try to re-login');
    console.error(err);

    // Clearing the JWT token will also trigger a state change in Vue because the user store
    // module is also updated.
    persistToken();
  },
});

/**
 * Inject authentication headers into every query sent to the server.
 */
const authLink = setContext((_, { headers }) => {
  const token = userStore.jwtToken.value;

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * The Apollo HTTP Link to use when querying the server.
 */
const httpLink = createHttpLink({
  uri: API_ENDPOINT,
});

/**
 * The default Apollo client used by services.
 */
const defaultClient = new ApolloClient({
  // @note Ordering is important here
  link: ApolloLink.from([errorLink, tokenLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

/**
 * Convienience method to call Apollo queries or reject if no data was returned.
 *
 * @param qry The GraphQL DocumentNode to send to the server.
 * @param variables The variables, if any, to send to the server for the provided query.
 * @returns The server result, or a rejected promise.
 */
export async function query<TReturn, TOptions = OperationVariables>(
  qry: DocumentNode,
  variables?: TOptions,
  fetchPolicy?: FetchPolicy,
) {
  const res = await defaultClient.query<TReturn>({ query: qry, variables, fetchPolicy });
  if (res.data) return Promise.resolve(res.data);
  return Promise.reject(new Error('An unknown error has occurred.'));
}

/**
 * Convienience method to call Apollo queries or reject if no data was returned.
 *
 * @param options
 * @returns The server result, or a rejected promise.
 */
export async function mutateCustom<TReturn, TVariables = OperationVariables>(
  options: MutationOptions<TReturn, TVariables>,
) {
  const res = await defaultClient.mutate<TReturn, TVariables>(options);
  if (res.data) return Promise.resolve(res.data);
  return Promise.reject(new Error('An unknown error has occurred.'));
}

/**
 * Convienience method to call Apollo mutations or reject if no data was returned.
 *
 * @param mutation The GraphQL DocumentNode to send to the server.
 * @param variables The variables, if any, to send to the server.
 * @returns An Apollo result object of the TReturn type.
 */
export async function mutate<TReturn, TOptions = OperationVariables>(
  mutation: DocumentNode,
  variables?: TOptions,
) {
  return mutateCustom<TReturn, TOptions>({ mutation, variables });
}

export default defaultClient;
