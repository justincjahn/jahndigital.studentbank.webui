/* eslint-disable import/no-extraneous-dependencies */
import { graphql } from 'msw';
import * as tokens from '@/common/utils/tests/tokens';

export const currentUserResponse = {
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
};

export const currentStudentResponse = {
  currentStudent: [
    {
      id: 1,
      accountNumber: '0000000069',
      firstName: 'Test',
      lastName: 'Student',
      groupId: 1,
      email: 'student@domain.tld',
      dateLastLogin: '2022-09-19T00:24:05.112Z',
      dateRegistered: '2022-08-07T22:41:12.474Z',
      group: {
        id: 1,
        instanceId: 1,
        name: 'test',
        instance: {
          id: 1,
          description: 'test',
          __typename: 'Instance',
        },
        __typename: 'Group',
      },
      __typename: 'Student',
    },
  ],
};

export const userLoginResponse = {
  userLogin: {
    jwtToken: tokens.userRefreshToken,
  },
};

export const studentLoginResponse = {
  userRefreshToken: {
    jwtToken: tokens.userRefreshToken,
  },
};

export const studentRefreshTokenResponse = {
  studentRefreshToken: {
    jwtToken: tokens.studentRefreshToken,
  },
};

export const userRevokeRefreshTokenResponse = {
  userRevokeRefreshToken: true,
};

const handlers = [
  graphql.mutation('userLogin', (_, res, ctx) => {
    return res(ctx.data(userLoginResponse));
  }),

  graphql.mutation('userRefreshToken', (_, res, ctx) => {
    return res(ctx.data(studentLoginResponse));
  }),

  graphql.mutation('studentRefreshToken', (_, res, ctx) => {
    return res(ctx.data(studentRefreshTokenResponse));
  }),

  graphql.mutation('userRevokeRefreshToken', (_, res, ctx) => {
    return res(ctx.data(userRevokeRefreshTokenResponse));
  }),

  graphql.query('currentUser', (_, res, ctx) => {
    return res(ctx.data(currentUserResponse));
  }),

  graphql.query('currentStudent', (_, res, ctx) => {
    return res(ctx.data(currentStudentResponse));
  }),

  graphql.query(/.*/, (_, res, ctx) => {
    return res(ctx.status(500));
  }),

  graphql.mutation(/.*/, (_, res, ctx) => {
    return res(ctx.status(500));
  }),
];

export default handlers;
