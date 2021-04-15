import { onLogin, onLogout } from '@/utils/login';
import userStore from '@/store/user';
import query from '@/modules/admin/graphql/mutations/userLogin.gql';
import ApolloServiceAbstract from './ApolloServiceAbstract';

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
    userStore.setLoading(true);

    try {
      const res = await this.client.mutate<UserLoginResponse>({
        mutation: query,
        variables: {
          username,
          password,
        },
      });

      if (res.data != null) {
        userStore.setToken(res.data.userLogin.jwtToken);
        await onLogin(this.client, res.data.userLogin.jwtToken);
      }
    } catch (e) {
      throw e.message;
    } finally {
      userStore.setLoading(false);
    }
  }

  /**
   * Log the user out.
   */
  async logout() {
    userStore.setToken(null);
    await onLogout(this.client);
  }
}
