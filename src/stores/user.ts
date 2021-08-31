import { reactive, computed } from 'vue';
import { PERSIST_TOKEN } from '@/constants';

// Utils
import parseJwt from '@/utils/parseJwt';

/**
 * Stores information about users in the system.  The auth service and Apollo will
 * push new JWT tokens to this store periodically as they expire, or as users login
 * and logoff.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setup() {
  const store = reactive({
    loading: false,
    id: -1,
    username: '',
    email: '',
    token: null as string | null,
    expiration: null as number | null,
    hydrated: false,
    isStudent: false,
    isPreauth: false,
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

    if (store.isStudent) {
      return (store.info as StudentInfo).accountNumber;
    }

    return (store.info as UserInfo).email;
  });

  // GETs the email of the user or student
  const email = computed(() => store.email || (store.info?.email ?? ''));

  // GETs the JWT token of the session
  const jwtToken = computed(() => store.token);

  // GETs the expiration timestamp of the token
  const tokenExpiration = computed(() => (store.expiration ?? 0) * 1000);

  // True if the user is a student
  const isStudent = computed(() => store.isStudent);

  // True if the token is for preauthentication
  const isPreauth = computed(() => store.isPreauth);

  // True if the current user is anonymous and hasn't logged in before
  const isAnonymous = computed(() => store.id === -1 && store.hydrated === false);

  // True if the user is authenticated
  const isAuthenticated = computed(() => store.token !== null || store.hydrated);

  // True if the user info has been provided by the auth service
  const hasInfo = computed(() => store.info !== null);

  /**
   * Clear data from local storage to fully log users out.
   */
  function clear() {
    localStorage.removeItem(PERSIST_TOKEN);
  }

  /**
   * Persist data to local storage for subsequent page reloads.
   */
  function persist() {
    const data: PersistedData = {
      iss: store.isStudent,
      pre: store.isPreauth,
    };

    localStorage.setItem(PERSIST_TOKEN, JSON.stringify(data));
  }

  /**
   * Attempt to hydrate stored data from local storage.
   */
  function hydrate() {
    const data = localStorage.getItem(PERSIST_TOKEN);
    if (!data) return;

    const userInfo: PersistedData|undefined = JSON.parse(data);
    if (!userInfo) return;

    store.hydrated = true;
    if (userInfo.iss) {
      store.isStudent = true;
    }

    if (userInfo.pre) {
      store.isPreauth = true;
    }
  }

  /**
   * Set the loading state of the store.
   *
   * @param s
   */
  function setLoading(s = false) { store.loading = s; }

  /**
   * Set the JWT token.
   *
   * @param token
   */
  function setToken(token: string | null) {
    store.token = token;

    if (token === null) {
      store.id = -1;
      store.username = '';
      store.email = '';
      store.isStudent = false;
      store.isPreauth = false;
      store.expiration = null;
      store.hydrated = false;
      store.info = null;
      clear();
      return;
    }

    const data = parseJwt(token);
    store.id = +data.nameid;
    store.username = data.unique_name;
    store.email = data.email;
    store.isStudent = data.utyp === 'student';
    store.isPreauth = (data?.pre ?? 'N') !== 'N';
    store.expiration = data.exp;
    store.info = null;
    persist();
  }

  /**
   * Set user information from a {UserInfo} or {StudentInfo} object.
   *
   * @param info
   */
  function setInfo(info: UserInfo | StudentInfo) {
    store.info = info;
    store.email = info.email;
    store.id = info.id;
    store.username = (info as StudentInfo)?.accountNumber ?? info.id;
  }

  hydrate();

  return {
    loading,
    id,
    username,
    email,
    jwtToken,
    tokenExpiration,
    isStudent,
    isPreauth,
    isAnonymous,
    isAuthenticated,
    hasInfo,
    setLoading,
    setToken,
    setInfo,
  };
}

const store = setup();
export type UserStore = ReturnType<typeof setup>;
export default store;
