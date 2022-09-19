import { beforeEach, describe, it, expect } from 'vitest';

// Utils
import '@/common/utils/tests/msw';
import '@/common/utils/tests/localStorage';

// Common
import * as constants from '@/common/constants';
import * as tokens from '@/common/utils/tests/tokens';
import UserState from '@/common/enums/UserState';

// Stores
import tokenStore from '@/common/stores/token';

// Graphql
import gqlCurrentUser from '@/common/graphql/queries/currentUser.gql';
import gqlCurrentStudent from '@/common/graphql/queries/currentStudent.gql';

// SUT
import defaultClient, { query } from '@/common/services/apollo';

beforeEach(async () => {
  tokenStore.token.value = null;
  await defaultClient.clearStore();
});

describe('TokenRefreshService.ts', () => {
  it('should attempt to obtain a refresh token if there was a previous student session', async () => {
    localStorage.setItem(constants.PERSIST_TOKEN, UserState.STUDENT.toString());
    tokenStore.hydrate();

    await query(gqlCurrentStudent);

    expect(tokenStore.isAuthenticated.value).toBe(true);
    expect(tokenStore.isStudent.value).toBe(true);
    expect(tokenStore.token.value).toBe(tokens.studentRefreshToken);
  });

  it('should attempt to obtain a refresh token if there was a previous user session', async () => {
    localStorage.setItem(constants.PERSIST_TOKEN, UserState.USER.toString());
    tokenStore.hydrate();

    await query(gqlCurrentUser);

    expect(tokenStore.isAuthenticated.value).toBe(true);
    expect(tokenStore.isStudent.value).toBe(false);
    expect(tokenStore.token.value).toBe(tokens.userRefreshToken);
  });

  it('should attempt to refresh an expired student token', async () => {
    tokenStore.token.value = tokens.expiredStudentRefreshToken;

    await query(gqlCurrentStudent);

    expect(tokenStore.isAuthenticated.value).toBe(true);
    expect(tokenStore.isStudent.value).toBe(true);
    expect(tokenStore.token.value).toBe(tokens.studentRefreshToken);
  });

  it('should attempt to refresh an expired user token', async () => {
    tokenStore.token.value = tokens.expiredUserRefreshToken;

    await query(gqlCurrentStudent);

    expect(tokenStore.isAuthenticated.value).toBe(true);
    expect(tokenStore.isStudent.value).toBe(false);
    expect(tokenStore.token.value).toBe(tokens.userRefreshToken);
  });
});
