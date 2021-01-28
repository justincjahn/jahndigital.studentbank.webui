import parseJwt from '@/utils/parseJwt';
import { computed, reactive } from 'vue';

/**
 * Stores information about users in the system.
 */
export function setup() {
  const store = reactive({
    loading: false,
    id: -1,
    username: '',
    email: '',
    token: null as string|null,
    expiration: null as number|null,
    isStudent: false,
  });

  // GETs the loading state of the fetch
  const loading = computed(() => store.loading);

  // GETs the ID number of the user
  const id = computed(() => store.id);

  // GETs the username of the user
  const username = computed(() => store.username);

  // GETs the JWT token of the session
  const jwtToken = computed(() => store.token);

  // GETs the expiration timestamp of the token
  const tokenExpiration = computed(() => (store.expiration ?? 0) * 1000);

  // True if the user is a student
  const isStudent = computed(() => store.isStudent);

  // True if the user is authenticated
  const isAuthenticated = computed(() => store.token !== null);

  // SETs the loading state of the fetch
  function setLoading(s = false) { store.loading = s; }

  // SETs the JWT Token and user information
  function setToken(token: string|null) {
    store.token = token;

    if (!token) {
      store.id = -1;
      store.username = '';
      store.email = '';
      store.isStudent = false;
      store.expiration = null;
      return;
    }

    const data = parseJwt(token);
    store.id = +data.nameid;
    store.username = data.unique_name;
    store.email = data.email;
    store.isStudent = data.utyp === 'student';
    store.expiration = data.exp;
  }

  return {
    loading,
    id,
    username,
    jwtToken,
    tokenExpiration,
    isStudent,
    isAuthenticated,
    setLoading,
    setToken,
  };
}

const store = setup();
export type UserStore = ReturnType<typeof setup>;
export default store;
