import { AUTH_TOKEN } from '@/constants';
import userStore from '@/store/user';

/**
 * Persist a JWT token to localStorage.
 *
 * @param token JWT token to persist.
 */
export default function persistToken(token?: string) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN);
  }

  userStore.setToken(token ?? null);
}
