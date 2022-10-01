import Money from '@/common/utils/Money';

/**
 * Ensures that the provided string is a valid monetary amount that's non-zero.
 *
 * @param value
 */
export default function validateAmountNonzero(value: string): string | boolean {
  if (!value || value.length === 0) return 'Specify an amount.';

  try {
    const num = Money.fromString(value);
    if (Money.round(num.getAmount()) === 0) return 'Amount cannot be zero.';
  } catch {
    return 'Amount must be a number.';
  }

  return true;
}
