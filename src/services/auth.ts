import constants from '@/constants';
import gqlUserLogin from '@/modules/admin/graphql/mutations/userLogin.gql';
import gqlStudentPreregistration from '@/graphql/mutations/studentPreregistration.gql';
import gqlStudentLogin from '@/graphql/mutations/studentLogin.gql';
import userStore from '../store/user';
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
export async function userLogin(input: LoginRequest) {
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
export async function studentLogin(input: LoginRequest) {
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
export async function studentPreregistration(input: StudentPreregistrationRequest) {
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
export async function info() {
  if (!userStore.isAuthenticated.value) {
    throw new Error(constants.ERROR_CODES.NOT_AUTHENTICATED);
  }

  userStore.setLoading(true);
  try {
    if (userStore.isStudent.value) {
      const g = await import('@/graphql/queries/currentStudent.gql');
      const res = await query<CurrentStudentResponse>(g);
      userStore.setInfo(res.currentStudent[0]);
    } else {
      const g = await import('@/graphql/queries/currentUser.gql');
      const res = await query<CurrentUserResponse>(g);
      userStore.setInfo(res.currentUser[0]);
    }
  } finally {
    userStore.setLoading(false);
  }
}

/**
 * Log the user or student out.
 */
export function logout() { userStore.setToken(null); }
