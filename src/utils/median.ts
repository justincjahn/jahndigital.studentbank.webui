/**
 * Calculates the median of the given array.
 *
 * @param values An array of numbers.
 * @returns The median value of the provided array.
 */
export default function median(values: number[]): number {
  if (values.length === 0) return 0;
  values.sort((a: number, b: number) => a - b);
  const half = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[half];
  }

  return (values[half - 1] + values[half]) / 2.0;
}
