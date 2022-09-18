import {
  afterAll,
  beforeEach,
  afterEach,
  beforeAll,
  describe,
  it,
  expect,
} from 'vitest';

// Global mocks
import '@/common/utils/tests/localStorage';
import '@/common/utils/tests/fetch';

// Web request mocking
import { setupServer } from 'msw/node';
import { graphql } from 'msw';

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

const handlers = [
  graphql.mutation('userLogin', (req, res, ctx) => {
    // const { username, password }: { username: string; password: string } =
    //   req.variables.input;

    return res(
      ctx.data({
        userLogin: {
          jwtToken: tokens.userRefreshToken,
        },
      })
    );
  }),

  graphql.mutation('userRefreshToken', (_, res, ctx) => {
    return res(
      ctx.data({
        userRefreshToken: {
          jwtToken: tokens.userRefreshToken,
        },
      })
    );
  }),

  graphql.mutation('studentRefreshToken', (_, res, ctx) => {
    return res(
      ctx.data({
        studentRefreshToken: {
          jwtToken: tokens.studentRefreshToken,
        },
      })
    );
  }),

  graphql.mutation('userRevokeRefreshToken', (_, res, ctx) => {
    return res(
      ctx.data({
        userRevokeRefreshToken: true,
      })
    );
  }),

  graphql.query('currentUser', (_, res, ctx) => {
    return res(
      ctx.data({
        currentUser: [
          {
            id: 1,
            email: 'test@domain.tld',
            roleId: 2,
            dateCreated: '2021-07-10T07:25:14.249Z',
            dateRegistered: '2021-07-10T06:55:39.074Z',
            dateLastLogin: '2022-09-17T08:52:10.667Z',
            role: {
              id: 2,
              name: 'Superuser',
              description: 'Built-in role with all permissions.',
              isBuiltIn: true,
              rolePrivileges: [
                {
                  privilegeId: 1,
                  roleId: 2,
                  privilege: {
                    id: 1,
                    name: 'P_ALL',
                    description: 'Allow all actions.',
                    dateCreated: '2021-07-10T06:55:37.945Z',
                    __typename: 'Privilege',
                  },
                  __typename: 'RolePrivilege',
                },
              ],
              __typename: 'Role',
            },
            __typename: 'User',
          },
        ],
      })
    );
  }),

  graphql.query('currentStudent', (_, res, ctx) => {
    return res(
      ctx.data({
        currentStudent: [
          {
            id: 1,
            email: 'test@domain.tld',
            roleId: 2,
            dateCreated: '2021-07-10T07:25:14.249Z',
            dateRegistered: '2021-07-10T06:55:39.074Z',
            dateLastLogin: '2022-09-17T08:52:10.667Z',
            role: {
              id: 2,
              name: 'Superuser',
              description: 'Built-in role with all permissions.',
              isBuiltIn: true,
              rolePrivileges: [
                {
                  privilegeId: 1,
                  roleId: 2,
                  privilege: {
                    id: 1,
                    name: 'P_ALL',
                    description: 'Allow all actions.',
                    dateCreated: '2021-07-10T06:55:37.945Z',
                    __typename: 'Privilege',
                  },
                  __typename: 'RolePrivilege',
                },
              ],
              __typename: 'Role',
            },
            __typename: 'User',
          },
        ],
      })
    );
  }),

  graphql.query(/.*/, (_, res, ctx) => {
    return res(ctx.status(500));
  }),

  graphql.mutation(/.*/, (_, res, ctx) => {
    return res(ctx.status(500));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});

beforeEach(async () => {
  tokenStore.token.value = null;
  await defaultClient.clearStore();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
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
