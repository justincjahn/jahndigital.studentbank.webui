/**
 * Callback function passed to validator utilities to check input values.
 */
export type ValidationFunc = (
  value: string
) => string | boolean | Promise<string | boolean>;
