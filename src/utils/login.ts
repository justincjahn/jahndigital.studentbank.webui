import { ApolloClient } from '@apollo/client';
import persistToken from './persistToken';

/**
 * Persists a JWT token and resets the Apollo client so it will use it.
 *
 * @param apolloClient The client to reset when the new token is persisted.
 * @param token The JWT token.
 */
export async function onLogin(apolloClient: ApolloClient<unknown>, token: string) {
  persistToken(token);

  try {
    await apolloClient.resetStore();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (login)', 'color: orange;', e.message);
  }
}

/**
 * Removes the JWT token from local storage and resets the Apollo client to clear cache.
 *
 * @param apolloClient The Apollo client to reset.
 */
export async function onLogout(apolloClient: ApolloClient<unknown>) {
  persistToken();

  try {
    await apolloClient.resetStore();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message);
  }
}

export default {
  onLogin,
  onLogout,
};
