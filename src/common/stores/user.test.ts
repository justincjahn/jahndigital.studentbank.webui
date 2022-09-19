import { beforeEach, describe, it, expect } from 'vitest';
import '@/common/utils/tests/msw';
import '@/common/utils/tests/localStorage';

// Common
import * as constants from '@/common/constants';
import * as tokens from '@/common/utils/tests/tokens';
import UserState from '@/common/enums/UserState';

// SUT
import tokenStore from '@/common/stores/token';
import userStore from '@/common/stores/user';

beforeEach(() => {
  tokenStore.token.value = null;
});

describe('stores/user.ts', () => {
  it('correctly hydrates user information from a token', async () => {
    tokenStore.token.value = tokens.userRefreshToken;

    // Setting userStore values from a token is not synchronous
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(userStore.email.value).toBe('test@domain.tld');
    expect(userStore.username.value).toBe('test@domain.tld');
    expect(userStore.id.value).toBe(1);
  });

  it('queries the server for user information when hydrated', async () => {
    localStorage.clear();
    localStorage.setItem(constants.PERSIST_TOKEN, UserState.USER.toString());
    tokenStore.hydrate();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(userStore.email.value).toBe('test@domain.tld');
    expect(userStore.username.value).toBe('test@domain.tld');
    expect(userStore.id.value).toBe(1);
  });

  it('queries the server for student information when hydrated', async () => {
    localStorage.clear();
    localStorage.setItem(constants.PERSIST_TOKEN, UserState.STUDENT.toString());
    tokenStore.hydrate();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(userStore.email.value).toBe('student@domain.tld');
    expect(userStore.username.value).toBe('0000000069');
    expect(userStore.id.value).toBe(1);
  });
});
