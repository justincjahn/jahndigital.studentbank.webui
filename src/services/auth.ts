import { ERROR_CODES } from '@/constants';
import gqlUserLogin from '@/graphql/mutations/userLogin.gql';
import gqlStudentPreregistration from '@/graphql/mutations/studentPreregistration.gql';
import gqlStudentLogin from '@/graphql/mutations/studentLogin.gql';
import userStore from '../stores/user';
import { mutate, query } from './Apollo';

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
export async function userLogin(input: LoginRequest): Promise<void> {
  userStore.setLoading(true);

  try {
    const res = await mutate<UserLoginResponse>(gqlUserLogin, input);
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
export async function studentLogin(input: LoginRequest): Promise<void> {
  userStore.setLoading(true);

  try {
    const res = await mutate<StudentLoginResponse>(gqlStudentLogin, input);
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
export async function studentPreregistration(input: StudentPreregistrationRequest): Promise<void> {
  userStore.setLoading(true);

  try {
    const res = await mutate<StudentPreregistrationResponse>(gqlStudentPreregistration, input);
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
      const res = await query<CurrentStudentResponse>(g, undefined, 'no-cache');
      userStore.setInfo(res.currentStudent[0]);
    } else {
      const g = await import('@/graphql/queries/currentUser.gql');
      const res = await query<CurrentUserResponse>(g, undefined, 'no-cache');
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
      await mutate<RevokeStudentRefreshTokenResponse>(g);
    } finally {
      userStore.setToken(null);
    }
  } else {
    const g = await import('@/graphql/mutations/userRevokeRefreshToken.gql');

    try {
      await mutate<RevokeUserRefreshTokenResponse>(g);
    } finally {
      userStore.setToken(null);
    }
  }
}
