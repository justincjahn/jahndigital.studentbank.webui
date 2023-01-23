/**
 * Ensure the account number is less than 10 digits, and only digits.
 */
export default function validateAccount(value: string): string | boolean {
  if (!value) {
    return 'Account number is required.';
  }

  if (value.length > 10) {
    return 'Account numbers cannot be more than 10 characters.';
  }

  if (!/^[0-9]+$/.test(value)) {
    return 'Account numbers can only contain numbers.';
  }

  return true;
}
