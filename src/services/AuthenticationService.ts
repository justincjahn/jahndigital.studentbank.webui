import { onLogin, onLogout } from '@/utils/login';
import UserLoginResponse from '@/@types/graphql/UserLoginResponse';
import UserStore from '@/store/modules/user';
import ApolloServiceAbstract from './ApolloServiceAbstract';
import query from '../graphql/userlogin.mutation.gql';

/**
 * Perform login and logout operations against the API.
 */
export default class AuthenticationService extends ApolloServiceAbstract {
  /**
   * Attempt to log a user in.
   *
   * @param username The user's email address.
   * @param password The user's password.
   */
  async login(username: string, password: string): Promise<void> {
    UserStore.setLoading(true);

    try {
      const res = await this.client.mutate<UserLoginResponse>({
        mutation: query,
        variables: {
          username,
          password,
        },
      });

      if (res.data != null) {
        UserStore.setToken(res.data.userLogin.jwtToken);
        await onLogin(this.client, res.data.userLogin.jwtToken);
      }
    } catch (e) {
      throw e.message;
    } finally {
      UserStore.setLoading(false);
    }
  }

  /**
   * Log the user out.
   */
  async logout() {
    UserStore.setToken();
    await onLogout(this.client);
  }
}
