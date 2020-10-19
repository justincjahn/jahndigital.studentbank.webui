import AuthenticateResponse from '../AuthenticateResponse';

/**
 * GraphQL response when logging in or refreshing user tokens.
 */
type UserLoginResponse = {
  userLogin: AuthenticateResponse;
}

export default UserLoginResponse;
