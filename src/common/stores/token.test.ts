import { beforeEach, describe, it, expect } from 'vitest';

// Global mocks
import '@/common/utils/tests/localStorage';

// Common
import * as tokens from '@/common/utils/tests/tokens';
import UserState from '@/common/enums/UserState';

// SUT
import tokenStore from '@/common/stores/token';

beforeEach(() => {
  tokenStore.token.value = null;
});

describe('stores/token.ts', () => {
  it('computes the correct user state from a given token', () => {
    tokenStore.token.value = tokens.userRefreshToken;

    expect(tokenStore.isStudent.value).toBe(false);
    expect(tokenStore.state.value).toBe(UserState.USER);
  });

  it('computes the correct user preregistration state from a given token', () => {
    tokenStore.token.value = tokens.userPreregistrationToken;

    expect(tokenStore.isStudent.value).toBe(false);
    expect(tokenStore.state.value).toBe(UserState.USER_PREREGISTRATION);
  });

  it('computes the correct student state from a given token', () => {
    tokenStore.token.value = tokens.studentRefreshToken;

    expect(tokenStore.isStudent.value).toBe(true);
    expect(tokenStore.state.value).toBe(UserState.STUDENT);
  });

  it('computes the correct student preregistration state from a given token', () => {
    tokenStore.token.value = tokens.studentPreregistrationToken;

    expect(tokenStore.isStudent.value).toBe(true);
    expect(tokenStore.state.value).toBe(UserState.STUDENT_PREREGISTRATION);
  });
});
