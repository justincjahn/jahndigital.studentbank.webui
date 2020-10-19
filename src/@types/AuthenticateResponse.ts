/**
 * GraphQL authentication object.
 */
type AuthenticateResponse = {
  // Unique ID of the user.
  id: number;

  // JSON Web Token (JWT) for the user.
  jwtToken: string;
}

export default AuthenticateResponse;
