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
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''),
  );

  return JSON.parse(jsonPayload) as JwtData;
}
