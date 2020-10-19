import { ApolloClient } from '@apollo/client';
import { onLogin, onLogout } from '@/utils/login';
import { persistRefreshToken } from '@/utils/tokenpersistence';
import UserLoginResponse from '@/@types/graphql/UserLoginResponse';
import UserStore from '@/store/modules/user';
import query from '../graphql/userlogin.mutation.gql';

export default class AuthenticationService {
  protected client: ApolloClient<unknown>;

  constructor(client: ApolloClient<unknown>) {
    this.client = client;
  }

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
        persistRefreshToken(res.data.userLogin.refreshToken);
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
    persistRefreshToken();
    await onLogout(this.client);
  }
}
