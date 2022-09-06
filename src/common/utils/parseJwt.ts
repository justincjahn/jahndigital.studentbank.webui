/**
 * Interface that defines what a parsed JWT object looks like.
 */
export interface JwtData {
  // User ID
  nameid: string;

  // Username
  unique_name: string;

  // Email address
  email: string;

  // User role (if user)
  role?: string;

  // Type of user (user || student)
  utyp: 'user' | 'student';

  // Preauthentication flag
  pre?: 'Y' | 'N';

  // JWT Not Before
  nbf: number;

  // JWT Expiration
  exp: number;

  // JWT Issued At
  iat: number;

  // JWT Issuer
  iss: string;
}

/**
 * Parse a JWT string into an object.
 *
 * @param token The JWT token to parse.
 */
export default function parseJwt(token: string): JwtData {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      // eslint-disable-next-line prefer-template
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload) as JwtData;
}
