import type {
  CurrentUserQuery,
  CurrentStudentQuery,
} from '@/generated/graphql';

import { reactive, computed, watch } from 'vue';

// Stores
import tokenStore from '@/common/stores/token';

// Services
import { publish } from '@/common/services/eventBus';

// Utils
import parseJwt from '@/common/utils/parseJwt';

// Common
import {
  userLogin as evtLogin,
  userLogout as evtLogout,
} from '@/common/events';

import { ERROR_CODES } from '@/common/constants';

/**
 * Information obtained from the GQL endpoint pertaining to the current student.
 */
export type StudentInfo = CurrentStudentQuery['currentStudent'][0];

/**
 * Information obtained from the GQL endpoint pertaining to the current user.
 */
export type UserInfo = CurrentUserQuery['currentUser'][0];

/**
 * Stores information about the currently logged in user. Relies on the token service to know
 * the user's login state.
 */
export function setup() {
  const store = reactive({
    hydrated: false,
    loading: false,
    id: -1,
    username: '',
    email: '',
    info: null as UserInfo | StudentInfo | null,
  });

  // Gets the loading state of the fetch
  const loading = computed(() => store.loading);

  // Gets the ID number of the user
  const id = computed(() => store.id);

  // Gets the username of the user
  const username = computed(() => {
    if (store.username.length > 0) return store.username;
    if (store.info === null) return '';

    if (tokenStore.isStudent) {
      return (store.info as StudentInfo).accountNumber;
    }

    return (store.info as UserInfo).email;
  });

  // Gets the email of the user or student
  const email = computed(() => store.email);

  // True if the store has completed first load hydration of user information
  const isHydrated = computed(() => store.hydrated);

  // True if the user is not currently authenticated and has never logged in before
  const isAnonymous = computed(() => tokenStore.isAnonymous.value);

  // True if the user is authenticated and the store contains user data
  const isAuthenticated = computed(
    () => tokenStore.isAuthenticated.value && store.info !== null
  );

  // True if the user is preauthorized for registration
  const isPreauthorized = computed(() => tokenStore.isPreauthorized.value);

  // True if the user is a student
  const isStudent = computed(() => tokenStore.isStudent.value);

  // Gets the expiration timestamp of the token
  const expiration = computed(() => tokenStore.expiration.value);

  /**
   * Get user information from the API and publish a login event.
   */
  async function getInfo() {
    if (tokenStore.state.value === null) {
      store.hydrated = true;
      return;
    }

    if (tokenStore.isPreauthorized.value) return;

    store.loading = true;

    try {
      let info: StudentInfo | UserInfo | undefined;
      if (tokenStore.isStudent.value) {
        const { studentInfo } = await import('@/common/services/auth');
        info = await studentInfo();
      } else {
        const { userInfo } = await import('@/common/services/auth');
        info = await userInfo();
      }

      store.info = info;
      store.email = info?.email ?? '';
      store.id = info.id;
      store.username =
        (info as StudentInfo).accountNumber ?? (info as UserInfo).email;

      publish(evtLogin, info);
    } catch (e: unknown) {
      if (!(e instanceof Error)) return;
      if (e.message === ERROR_CODES.NOT_AUTHORIZED) return;
      throw e;
    } finally {
      store.hydrated = true;
      store.loading = false;
    }
  }

  /**
   * Log a user or student in or throw an error if the login failed.
   *
   * @param username
   * @param password
   * @param student True if the user is attempting to login as a student.
   */
  async function login(user: string, password: string, student = false) {
    store.loading = true;

    try {
      let data: string | null = null;

      if (student) {
        const { studentLogin } = await import('@/common/services/auth');
        data = await studentLogin({ username: user, password });
      } else {
        const { userLogin } = await import('@/common/services/auth');
        data = await userLogin({ username: user, password });
      }

      if (data === null) {
        throw new Error(ERROR_CODES.NOT_AUTHORIZED);
      }

      // @note triggers a watch defined below.
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
        const { studentLogout } = await import('@/common/services/auth');
        await studentLogout();
      } else {
        const { userLogout } = await import('@/common/services/auth');
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
      store.info = null;
      return;
    }

    const data = parseJwt(newValue);
    store.id = +data.nameid;
    store.username = data.unique_name;
    store.email = data.email;
  });

  // Get info from the API when the token state is set
  watch(
    tokenStore.state,

    (newValue, oldValue) => {
      if (newValue === oldValue) return;
      getInfo().catch(() => {
        // Don't need to do anything- the auth manager will clear the store
      });
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
    isHydrated,
    isAnonymous,
    isAuthenticated,
    isPreauthorized,
    isStudent,
    expiration,
    login,
    logout,
  };
}

const store = setup();
export type UserStore = ReturnType<typeof setup>;
export default store;
