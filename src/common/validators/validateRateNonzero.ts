import Rate from '@/common/utils/Rate';

/**
 * Ensures that the provided string is a valid rate with a non-zero value.
 *
 * @param {string} value
 * @returns true or an error message.
 */
export default function validateRateNonzero(value: string): string | boolean {
  if (!value || value.trim().length === 0) return 'Specify a rate.';

  try {
    const rate = Rate.fromString(value);
    if (rate.getRate() === 0) return 'Rate cannot be zero.';
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
  }

  return true;
}
