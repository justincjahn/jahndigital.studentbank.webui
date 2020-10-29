import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  Operation,
  ServerParseError,
  throwServerError,
} from '@apollo/client';

import persistToken from '@/utils/persistToken';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import UserStore from '@/store/modules/user';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { ERROR_CODES, API_ENDPOINT } from '@/constants';

/**
 * The Apollo HTTP Link to use when querying the server.
 */
const httpLink = createHttpLink({
  uri: API_ENDPOINT,
});

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
const authLink = setContext(async (_, { headers }) => {
  const token = UserStore.jwtToken;

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * Automatically attempt to refresh the user's JWT token using the stored refresh token.
 */
const tokenLink = new TokenRefreshLink({
  isTokenValidOrUndefined: () => !UserStore.isExpired || UserStore.jwtToken === null,

  fetchAccessToken: () => {
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

    if (UserStore.isStudent) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleResponse: (operation: Operation, accessTokenField: string) => (response: Response) => {
    const r = response
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

          // Update the context to use the new JWT token
          const context = operation.getContext();
          context.headers = {
            ...context.headers,
            Authorization: `Bearer ${data.jwtToken}`,
          };

          operation.setContext(context);

          return {
            data: {
              // eslint-disable-next-line @typescript-eslint/camelcase
              access_token: data.jwtToken,
            },
          };
        }

        return throwServerError(
          response,
          parsedBody,
          'Response not successful: no token returned.',
        );
      });

    return r;
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
 * The default Apollo client used by services.
 */
const defaultClient = new ApolloClient({
  link: ApolloLink.from([authLink, errorLink, tokenLink, httpLink]),
  cache: new InMemoryCache(),
});

export default defaultClient;
