import {
  afterAll,
  beforeEach,
  afterEach,
  beforeAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';

// Web request mocking
import { setupServer } from 'msw/node';
import { graphql } from 'msw';
import fetch, { Headers, Request, Response } from 'node-fetch';

// Common
import * as constants from '@/common/constants';
import gqlUserInfo from '@/common/graphql/queries/currentUser.gql';

const userRefreshToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOjEsInVuaXF1ZV9uYW1lIjoidGVzdEBkb21haW4udGxkIiwiZW1haWwiOiJ0ZXN0QGRvbWFpbi50bGQiLCJyb2xlIjoic3VwZXJ1c2VyIiwidXR5cCI6InVzZXIiLCJwcmUiOiJOIiwiZXhwIjo0MTAyNDcwMDAwLCJuYmYiOjE1MTYyMzkwMjIsImlhdCI6MTUxNjIzOTAyMn0.kJ5cj55o3lGUUdd9EuleLzSlnrAtm7eWcrBPZv3jdLA';

// const expiredUserRefreshToken =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOjEsInVuaXF1ZV9uYW1lIjoidGVzdEBkb21haW4udGxkIiwiZW1haWwiOiJ0ZXN0QGRvbWFpbi50bGQiLCJyb2xlIjoic3VwZXJ1c2VyIiwidXR5cCI6InVzZXIiLCJwcmUiOiJOIiwiZXhwIjoxNTE2MjM5MDIyLCJuYmYiOjE1MTYyMzkwMjIsImlhdCI6MTUxNjIzOTAyMn0.I6bbv-va_BSDcl3iodajh39iHVuXLZqCQvurWvZSoNk';

const studentRefreshToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOjEsInVuaXF1ZV9uYW1lIjoidGVzdEBkb21haW4udGxkIiwiZW1haWwiOiJ0ZXN0QGRvbWFpbi50bGQiLCJyb2xlIjoic3VwZXJ1c2VyIiwidXR5cCI6InN0dWRlbnQiLCJwcmUiOiJOIiwiZXhwIjo0MTAyNDcwMDAwLCJuYmYiOjE1MTYyMzkwMjIsImlhdCI6MTUxNjIzOTAyMn0.r_Y-2qpSlQYI_IS_UQyPfcAlPsgA9MrZEF9XVBcJHz0';

// const expiredStudentRefreshToken =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOjEsInVuaXF1ZV9uYW1lIjoidGVzdEBkb21haW4udGxkIiwiZW1haWwiOiJ0ZXN0QGRvbWFpbi50bGQiLCJyb2xlIjoic3VwZXJ1c2VyIiwidXR5cCI6InN0dWRlbnQiLCJwcmUiOiJOIiwiZXhwIjoxNTE2MjM5MDIyLCJuYmYiOjE1MTYyMzkwMjIsImlhdCI6MTUxNjIzOTAyMn0.zu1xl1aH_9HAA8U6DycX-AiKNoJC-vxfDsCsEPE6uJk';

const handlers = [
  graphql.mutation('userLogin', (req, res, ctx) => {
    // const { username, password }: { username: string; password: string } =
    //   req.variables.input;

    return res(
      ctx.data({
        userLogin: {
          jwtToken: userRefreshToken,
        },
      })
    );
  }),

  graphql.mutation('userRefreshToken', (_, res, ctx) => {
    return res(
      ctx.data({
        userRefreshToken: {
          jwtToken: userRefreshToken,
        },
      })
    );
  }),

  graphql.mutation('studentRefreshToken', (_, res, ctx) => {
    return res(
      ctx.data({
        studentRefreshToken: {
          jwtToken: studentRefreshToken,
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

  graphql.query(/.*/, (_, res, ctx) => {
    return res(ctx.status(500));
  }),

  graphql.mutation(/.*/, (_, res, ctx) => {
    return res(ctx.status(500));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => {
  vi.stubGlobal('fetch', fetch);
  vi.stubGlobal('Headers', Headers);
  vi.stubGlobal('Request', Request);
  vi.stubGlobal('Response', Response);

  server.listen();
});

beforeEach(() => {
  let localStore: Record<string, any> = {};

  const localStorage = {
    getItem: vi.fn((key: string) =>
      key in localStore ? localStore[key] : null
    ),

    setItem: vi.fn((key: string, value: string) => {
      localStore[key] = `${value}`;
    }),

    removeItem: vi.fn((key: string) => {
      if (!(key in localStore)) return;
      delete localStore[key];
    }),

    clear: vi.fn(() => {
      localStore = {};
    }),
  };

  vi.stubGlobal('localStorage', localStorage);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('TokenRefreshService.ts', () => {
  it('should attempt to obtain a refresh token if there was a previous session', async () => {
    const { default: UserState } = await import('@/common/enums/UserState');
    localStorage.setItem(constants.PERSIST_TOKEN, UserState.STUDENT.toString());
    const { default: tokenStore } = await import('@/common/stores/token');
    const { query } = await import('@/common/services/apollo');
    await query(gqlUserInfo);
    expect(tokenStore.isAuthenticated.value).toBe(true);
    expect(tokenStore.isStudent.value).toBe(true);
    expect(tokenStore.token.value).toBe(studentRefreshToken);
  });
});
