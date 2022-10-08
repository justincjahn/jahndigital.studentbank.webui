let uniqueId = 0;

/**
 * Increments a global counter and returns the latest number.
 *
 * @returns An application-unique ID number.
 */
export default function useUniqueId() {
  uniqueId += 1;
  return uniqueId.toString();
}
