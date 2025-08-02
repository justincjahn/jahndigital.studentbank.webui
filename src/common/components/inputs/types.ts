import { MaybeRef } from "vue";

/**
 * Callback function passed to validator utilities to check input values.
 */
export type ValidationFunc = (
  value: string
) => MaybeRef<string | boolean | Promise<string | boolean>>;
