// The endpoint URL for the API
export const API_ENDPOINT: string = process.env.VUE_APP_API_URL || '/graphql';

// Maximum number of mutations to run at once
export const API_MAX_CONCURRENCY: number = process.env.VUE_APP_API_MAX_CONCURRENCY || 5;

// The name of the site.
// NOTE: The default for this variable is defined in the vue.config.js file.
export const SITE_NAME: string = process.env.VUE_APP_SITE_NAME || 'ERROR';

// The import URL for the theme file containing variables for SCSS
// NOTE: The default for this variable is defined in the vue.config.js file.
// NOTE: This is auto-imported by Webpack, so you probably don't need it.
export const THEME: string = process.env.VUE_APP_THEME || 'ERROR';

// The key to use when persisting data in localstorage
export const PERSIST_TOKEN = 'sbi';

// Base URLs for the application
export const BASE_URLS = {
  ADMIN: 'admin',
  REGISTER: 'register',
  STUDENT: '',
};

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
