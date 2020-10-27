// The endpoint URL for the API
export const API_ENDPOINT = process.env.VUE_APP_API_URL || '/graphql';

// The localStorage key to use when storing the JWT token.
export const AUTH_TOKEN = 'jwt-token';

// Potential types of users in the system.
export const USER_TYPES = {
  USER: 'user',
  STUDENT: 'student',
};

// Potential error codes returned by the GraphQL server.
export const ERROR_CODES = {
  NOT_AUTHENTICATED: 'AUTH_NOT_AUTHENTICATED',
  NOT_AUTHORIZED: 'AUTH_NOT_AUTHORIZED',
  NOT_FOUND: 'ERROR_NOT_FOUND',
  QUERY_FAILED: 'ERROR_QUERY_FAILED',
};

export const FETCH_OPTIONS = {
  // The default amount of items to fetch when pagination is in use
  DEFAULT_COUNT: 25,
};

export default {
  API_ENDPOINT,
  AUTH_TOKEN,
  ERROR_CODES,
};
