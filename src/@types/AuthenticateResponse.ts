type AuthenticateResponse = {
  id: number;

  jwtToken: string;

  refreshToken: string;
}

export default AuthenticateResponse;
