import {
  Module,
  VuexModule,
  Mutation,
  getModule,
} from 'vuex-module-decorators';
import store from '@/store';
import parseJwt from '@/utils/parseJwt';
import IUserState from './IUserState';

/**
 * User state information, such as username, password, ID number, etc.
 */
@Module({ dynamic: true, store, name: 'user' })
class UserState extends VuexModule implements IUserState {
  id = -1;

  username = '';

  email = '';

  token?: string;

  expiration?: number;

  isStudent = false;

  loading = false;

  /**
   * Set the loading state to the value provided.
   *
   * @param loading The loading state.
   */
  @Mutation
  setUsersLoading(loading: boolean) {
    this.loading = loading;
  }

  /**
   * Set the JWT token, and deserialize it into state values.
   *
   * @param token The JWT token, or undefined.
   */
  @Mutation
  async setToken(token?: string) {
    this.token = token;

    if (typeof token === 'undefined') {
      this.username = '';
      this.email = '';
      this.isStudent = false;
      this.id = -1;
      this.expiration = undefined;
      return;
    }

    const data = parseJwt(token);
    this.username = data.unique_name;
    this.email = data.email ?? '';
    this.isStudent = data.utyp === 'student';
    this.id = +data.unique_name;
    this.expiration = data.exp;
  }

  /**
   * Gets if the user is authenticated.
   */
  get isAuthenticated() {
    if (this.token) {
      return !this.isExpired;
    }

    return false;
  }

  /**
   * Gets if the user's JWT token has expired.
   */
  get isExpired() {
    if (!this.token || !this.expiration) {
      return true;
    }

    if (Date.now() >= this.expiration * 1000) {
      return true;
    }

    return false;
  }

  /**
   * Gets the user's JWT token.
   */
  get jwtToken() {
    return this.token ?? null;
  }
}

const UserModule = getModule(UserState);
export default UserModule;
