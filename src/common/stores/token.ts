import { reactive, computed } from 'vue';
import UserState from '@/common/enums/UserState';
import { PERSIST_TOKEN } from '@/common/constants';
import parseJwt, { JwtData } from '@/common/utils/parseJwt';

/**
 * Stores critical information about a user's JWT token.  Hydrates the last login status
 * from localStorage to help indicate if the user may have a valid refresh token stored
 * in an HTTP only cookie.
 */
function setup() {
  const store = reactive({
    token: null as string | null,
    state: null as UserState | null,
    expiration: null as number | null,
  });

  // Get the UserState of the user. If it's null, then it hasn't been hydrated or the user
  /// has never logged in before.
  const state = computed(() => store.state);

  // Get the unix timestamp representing the expiration time of the token
  const expiration = computed(() => (store.expiration ?? 0) * 1000);

  /**
   * Determine the user's state based on the data inside the JWT token.
   */
  function computeState(data: JwtData | null) {
    if (data === null) {
      store.state = null;
      return;
    }

    if (data.utyp === 'student') {
      if ((data?.pre ?? 'N') !== 'N') {
        store.state = UserState.STUDENT_PREREGISTRATION;
      } else {
        store.state = UserState.STUDENT;
      }
    } else if ((data?.pre ?? 'N') !== 'N') {
      store.state = UserState.USER_PREREGISTRATION;
    } else {
      store.state = UserState.USER;
    }
  }

  // Get or set the JWT token of the user.  If it's null, then the user is considered logged out.
  const token = computed({
    get() {
      return store.token;
    },

    set(value) {
      store.token = value;

      if (value === null) {
        computeState(null);
      } else {
        const data = parseJwt(value);
        store.expiration = data.exp;
        computeState(data);
      }

      if (store.state !== null) {
        localStorage.setItem(PERSIST_TOKEN, store.state.toString());
      } else {
        localStorage.removeItem(PERSIST_TOKEN);
      }
    },
  });

  // True if the current user is anonymous and hasn't logged in before
  const isAnonymous = computed(
    () => store.token === null && store.state === null
  );

  // True if the token is for preauthentication
  const isPreauthorized = computed(
    () =>
      store.state === UserState.USER_PREREGISTRATION ||
      store.state === UserState.STUDENT_PREREGISTRATION
  );

  // True if the user is authenticated
  const isAuthenticated = computed(
    () => store.token !== null || store.state !== null
  );

  // True if the user is a student
  const isStudent = computed(() => store.state === UserState.STUDENT);

  // Hydrate the state from local storage
  const data = localStorage.getItem(PERSIST_TOKEN);

  if (data) {
    store.state = +data;
  }

  return {
    token,
    expiration,
    state,
    isAnonymous,
    isPreauthorized,
    isAuthenticated,
    isStudent,
  };
}

const tokenStore = setup();
export type TokenStore = ReturnType<typeof setup>;
export default tokenStore;
