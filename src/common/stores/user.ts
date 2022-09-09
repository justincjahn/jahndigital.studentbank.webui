import type {
  CurrentUserQuery,
  CurrentStudentQuery,
} from '@/generated/graphql';

import { reactive, computed, watch } from 'vue';

// Stores
import tokenStore from '@/common/stores/token';

// Services
import {
  userInfo,
  studentInfo,
  userLogin,
  studentLogin,
  userLogout,
  studentLogout,
} from '@/common/services/auth';

// Utils
import parseJwt from '@/common/utils/parseJwt';

import { publish } from '@/common/services/eventBus';

import {
  userLogin as evtLogin,
  userLogout as evtLogout,
} from '@/common/events';

import { ERROR_CODES } from '../constants';

/**
 * Information obtained from the GQL endpoint pertaining to the current student.
 */
export type StudentInfo = CurrentStudentQuery['currentStudent'][0];

/**
 * Information obtained from the GQL endpoint pertaining to the current user.
 */
export type UserInfo = CurrentUserQuery['currentUser'][0];

/**
 * Stores information about users in the system.  The auth service and Apollo will
 * push new JWT tokens to this store periodically as they expire, or as users login
 * and logoff.
 */
export function setup() {
  const store = reactive({
    loading: false,
    id: -1,
    username: '',
    email: '',
    expiration: null as number | null,
    info: null as UserInfo | StudentInfo | null,
  });

  // GETs the loading state of the fetch
  const loading = computed(() => store.loading);

  // GETs the ID number of the user
  const id = computed(() => store.id);

  // GETs the username of the user
  const username = computed(() => {
    if (store.username.length > 0) return store.username;
    if (store.info === null) return '';

    if (tokenStore.isStudent) {
      return (store.info as StudentInfo).accountNumber;
    }

    return (store.info as UserInfo).email;
  });

  // GETs the email of the user or student
  const email = computed(() => store.email || (store.info?.email ?? ''));

  // GETs the expiration timestamp of the token
  const tokenExpiration = computed(() => (store.expiration ?? 0) * 1000);

  // True if the user info has been provided by the auth service
  const hasInfo = computed(() => store.info !== null);

  // True if the use has not logged in before
  const isAnonymous = computed(() => tokenStore.isAnonymous.value);

  // True if the user is authenticated or has logged in before and may have a valid refresh token
  const isAuthenticated = computed(() => tokenStore.isAuthenticated.value);

  // True if the user is preauthorized for registration
  const isPreauthorized = computed(() => tokenStore.isPreauthorized.value);

  // True if the user is a student
  const isStudent = computed(() => tokenStore.isStudent.value);

  /**
   * Get user information from the API.
   */
  async function getInfo() {
    if (tokenStore.state.value === null) return;
    if (tokenStore.isPreauthorized.value) return;

    store.loading = true;

    try {
      const info = tokenStore.isStudent.value
        ? await studentInfo()
        : await userInfo();

      store.info = info;
      store.email = info?.email ?? '';
      store.id = info.id;
      store.username = (info as StudentInfo)?.accountNumber ?? info.id;

      publish(evtLogin, info);
    } catch (e: unknown) {
      if (!(e instanceof Error)) return;
      if (e.message === ERROR_CODES.NOT_AUTHORIZED) return;
      throw e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Log a user or student in.
   *
   * @param username
   * @param password
   * @param student True if the user is attempting to login as a student.
   */
  async function login(user: string, password: string, student = false) {
    store.loading = true;

    try {
      const data = student
        ? await studentLogin({ username: user, password })
        : await userLogin({ username: user, password });

      if (data === null) {
        throw new Error(ERROR_CODES.NOT_AUTHORIZED);
      }

      tokenStore.token.value = data;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Log a user or student out.
   */
  async function logout() {
    store.loading = true;

    try {
      if (tokenStore.isStudent.value) {
        await studentLogout();
      } else {
        await userLogout();
      }
    } finally {
      store.loading = false;
      tokenStore.token.value = null;
      publish(evtLogout);
    }
  }

  // Update the data in the store when the JWT token changes
  watch(tokenStore.token, (newValue, oldValue) => {
    if (newValue === oldValue) return;

    if (newValue === null) {
      store.id = -1;
      store.username = '';
      store.email = '';
      store.expiration = null;
      store.info = null;
      return;
    }

    const data = parseJwt(newValue);
    store.id = +data.nameid;
    store.username = data.unique_name;
    store.email = data.email;
    store.expiration = data.exp;
    store.info = null;
  });

  // Get info from the API when the token is hydrated
  watch(
    tokenStore.state,

    (newValue, oldValue) => {
      if (newValue === oldValue) return;
      getInfo();
    },

    {
      immediate: true,
    }
  );

  return {
    loading,
    id,
    username,
    email,
    tokenExpiration,
    hasInfo,
    isAnonymous,
    isAuthenticated,
    isPreauthorized,
    isStudent,
    login,
    logout,
  };
}

const store = setup();
export type UserStore = ReturnType<typeof setup>;
export default store;
