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

import type { UserInfo, StudentInfo } from '@/common/stores/user';

// Services
import { mutate, query } from './apollo';

/**
 * Attempt to log the user in.
 *
 * @param input
 * @returns A JWT token or null if the login failed.
 */
export async function userLogin(
  input: UserLoginMutationVariables
): Promise<string | null> {
  const { default: g } = await import(
    '@/common/graphql/mutations/userLogin.gql'
  );

  try {
    const res = await mutate<UserLoginMutation>(g, input);
    return res.userLogin.jwtToken;
  } catch (e) {
    return null;
  }
}

/**
 * Attempt to log the user in.
 *
 * @param input
 * @returns A JWT token or null if the login failed.
 */
export async function studentLogin(
  input: StudentLoginMutationVariables
): Promise<string | null> {
  try {
    const { default: g } = await import(
      '@/common/graphql/mutations/studentLogin.gql'
    );

    const res = await mutate<StudentLoginMutation>(g, input);
    return res.studentLogin.jwtToken;
  } catch {
    return null;
  }
}

/**
 * Attempt to preregister the student.
 *
 * @param input
 * @returns A JWT token or null if the preregistration failed.
 */
export async function studentPreregistration(
  input: StudentPreregistrationMutationVariables
): Promise<string | null> {
  const { default: g } = await import(
    '@/common/graphql/mutations/studentPreregistration.gql'
  );

  try {
    const res = await mutate<StudentPreregistrationMutation>(g, input);
    return res.studentPreregistration;
  } catch {
    return null;
  }
}

/**
 * Fetch user information from the server.
 */
export async function userInfo(): Promise<UserInfo> {
  const { default: g } = await import(
    '@/common/graphql/queries/currentUser.gql'
  );

  const res = await query<CurrentUserQuery>(g, undefined, 'no-cache');
  return res.currentUser[0];
}

/**
 * Fetch student information from the server.
 */
export async function studentInfo(): Promise<StudentInfo> {
  const { default: g } = await import(
    '@/common/graphql/queries/currentUser.gql'
  );

  const res = await query<CurrentStudentQuery>(g, undefined, 'no-cache');
  return res.currentStudent[0];
}

/**
 * Log out the current user.
 */
export async function userLogout(): Promise<void> {
  const { default: g } = await import(
    '@/common/graphql/mutations/userRevokeRefreshToken.gql'
  );

  await mutate<UserRevokeRefreshTokenMutation>(g);
}

/**
 * Log out the current student.
 */
export async function studentLogout(): Promise<void> {
  const { default: g } = await import(
    '@/common/graphql/mutations/studentRevokeRefreshToken.gql'
  );

  await mutate<StudentRevokeRefreshTokenMutation>(g);
}
