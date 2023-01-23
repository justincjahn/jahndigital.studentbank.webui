import validateEmail from './validateEmail';

/**
 * Validate an email address if it's specified, otherwise return true.
 *
 * @param value
 */
export default function validateEmailOptional(value: string): string | boolean {
  if (typeof value === 'undefined' || value.length === 0) return true;
  return validateEmail(value);
}
