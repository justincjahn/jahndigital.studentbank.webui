import { ERROR_CODES } from '@/common/constants';

import type {
  UserLoginMutation,
  UserLoginMutationVariables,
  StudentLoginMutation,
  StudentLoginMutationVariables,
  StudentPreregistrationMutation,
  StudentPreregistrationMutationVariables,
  CurrentStudentQuery,
  CurrentUserQuery,
  UserRevokeRefreshTokenMutation,
  StudentRevokeRefreshTokenMutation,
} from '@/generated/graphql';

// GQL
import gqlUserLogin from '@/graphql/mutations/userLogin.gql';
import gqlStudentPreregistration from '@/graphql/mutations/studentPreregistration.gql';
import gqlStudentLogin from '@/graphql/mutations/studentLogin.gql';

// Stores
import userStore from '../stores/user';

// Services
import { mutate, query } from './apollo';

/**
 * Instead of stores calling service functions, this service stores data within a store.
 * While counterintuitive, it helps to eliminate cyclic dependencies as a result of the
 * authentication process for Apollo. Possible solve via dependency injection, event bus?
 */

/**
 * Attempt to log the user in.
 *
 * @param input
 * @returns
 */
export async function userLogin(
  input: UserLoginMutationVariables
): Promise<void> {
  userStore.setLoading(true);

  try {
    const res = await mutate<UserLoginMutation>(gqlUserLogin, input);
    userStore.setToken(res.userLogin.jwtToken);
  } finally {
    userStore.setLoading(false);
  }
}

/**
 * Attempt to log the student in.
 *
 * @param input
 * @returns
 */
export async function studentLogin(
  input: StudentLoginMutationVariables
): Promise<void> {
  userStore.setLoading(true);

  try {
    const res = await mutate<StudentLoginMutation>(gqlStudentLogin, input);
    userStore.setToken(res.studentLogin.jwtToken);
  } finally {
    userStore.setLoading(false);
  }
}

/**
 * Attempt to preregister the student.
 *
 * @param input
 * @returns
 */
export async function studentPreregistration(
  input: StudentPreregistrationMutationVariables
): Promise<void> {
  userStore.setLoading(true);

  try {
    const res = await mutate<StudentPreregistrationMutation>(
      gqlStudentPreregistration,
      input
    );

    userStore.setToken(res.studentPreregistration);
  } finally {
    userStore.setLoading(false);
  }
}

/**
 * Fetch user or student information from the server.
 */
export async function info(): Promise<void> {
  if (!userStore.isAuthenticated.value) {
    throw new Error(ERROR_CODES.NOT_AUTHENTICATED);
  }

  userStore.setLoading(true);
  try {
    if (userStore.isStudent.value) {
      const g = await import('@/graphql/queries/currentStudent.gql');
      const res = await query<CurrentStudentQuery>(g, undefined, 'no-cache');
      userStore.setInfo(res.currentStudent[0]);
    } else {
      const g = await import('@/graphql/queries/currentUser.gql');
      const res = await query<CurrentUserQuery>(g, undefined, 'no-cache');
      userStore.setInfo(res.currentUser[0]);
    }
  } finally {
    userStore.setLoading(false);
  }
}

/**
 * Log the user or student out.
 */
export async function logout(): Promise<void> {
  if (userStore.isStudent.value) {
    const g = await import('@/graphql/mutations/studentRevokeRefreshToken.gql');

    try {
      await mutate<StudentRevokeRefreshTokenMutation>(g);
    } finally {
      userStore.setToken(null);
    }
  } else {
    const g = await import('@/graphql/mutations/userRevokeRefreshToken.gql');

    try {
      await mutate<UserRevokeRefreshTokenMutation>(g);
    } finally {
      userStore.setToken(null);
    }
  }
}
