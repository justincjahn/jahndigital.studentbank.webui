import Rate from '@/common/utils/Rate';

/**
 * Ensures that the rate is valid.
 *
 * @param {string} value
 * @returns true or an error message.
 */
export default function validateRate(value: string): string | boolean {
  if (!value || !value.trim()) return 'Rate is required.';

  try {
    Rate.fromString(value);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
  }

  return true;
}
