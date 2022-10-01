import Rate from '@/common/utils/Rate';

/**
 * Ensures that the provided string is a valid rate greater than zero.
 *
 * @param {string} value
 * @returns true or an error message.
 */
export default function validateRateNonnegative(
  value: string
): string | boolean {
  if (!value || value.trim().length === 0) return 'Specify a rate.';

  try {
    const rate = Rate.fromString(value);
    if (rate.getRate() < 0.0) return 'Rate cannot be negative.';
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
  }

  return true;
}
