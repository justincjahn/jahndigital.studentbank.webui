/**
 * Data inside of the StudentBank JWT token
 */
type JwtData = {
  // User ID
  nameid: string;

  // Username
  unique_name: string;

  // Email address
  email: string;

  // User role (if user)
  role?: string;

  // Type of user (user || student)
  utyp: string;

  // JWT Not Before
  nbf: number;

  // JWT Expiration
  exp: number;

  // JWT Issued At
  iat: number;

  // JWT Issuer
  iss: string;
}

export default JwtData;
