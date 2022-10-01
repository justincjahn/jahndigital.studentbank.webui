import Money from '@/common/utils/Money';

/**
 * Ensures that the provided string is a valid monetary value that is not negative.
 *
 * @param value
 */
export default function validateAmountNonnegative(
  value: string
): string | boolean {
  if (!value || value.length === 0) return 'Specify an amount.';

  try {
    const num = Money.fromString(value);
    if (num.round() < 0) return 'Amount cannot be negative.';
  } catch {
    return 'Amount must be a number.';
  }

  return true;
}
