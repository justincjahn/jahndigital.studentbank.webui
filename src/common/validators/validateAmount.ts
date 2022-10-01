import Money from '@/common/utils/Money';

/**
 * Ensures that the provided string is a valid monetary value.
 *
 * @param value
 */
export default function validateAmount(value: string): string | boolean {
  if (!value || value.length === 0) return 'Specify an amount.';

  try {
    Money.fromString(value);
  } catch {
    return 'Amount must be a number.';
  }

  return true;
}
