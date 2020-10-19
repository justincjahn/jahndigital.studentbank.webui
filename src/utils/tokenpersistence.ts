import { AUTH_TOKEN, REFRESH_TOKEN } from '@/constants';
import UserStore from '@/store/modules/user';

export function persistToken(token?: string) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN);
  }

  UserStore.setToken(token);
}

export function persistRefreshToken(token?: string) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN);
  }
}

export function jwtToken(): string | null {
  if (!localStorage) return null;
  return localStorage.getItem(AUTH_TOKEN);
}

export function refreshToken(): string | null {
  if (!localStorage) return null;
  return localStorage.getItem(REFRESH_TOKEN);
}
