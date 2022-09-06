/**
 * Callback function passed to validator utilities to check input values.
 */
export type validationFunc = (value: string) => string | boolean | Promise<string | boolean>;

/**
 * Represents an item in a dropdown menu.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item = Record<string, any>|number|string|null;

/**
 * Function definition that returns a string representation of an item.
 */
export type Search = (obj: Item) => string;
