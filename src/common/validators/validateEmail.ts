/**
 * Ensure the email address is valid.
 */
export default function validateEmail(value: string): string|boolean {
  if (!value) {
    return 'Email is required.';
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.]+\.[a-zA-Z-]+$/.test(value)) {
    return ' Email is invalid.';
  }

  return true;
}
