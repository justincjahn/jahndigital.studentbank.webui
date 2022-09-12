/**
 * Generate a UUIDv4 string.
 *
 * Modified from a StackOverflow post to be TypeScript friendly:
 * https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
 */
export default function uuid4(): string {
  return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(
    /[018]/g,
    // eslint-disable-next-line no-bitwise, no-mixed-operators, prettier/prettier
    (c) => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
  );
}
