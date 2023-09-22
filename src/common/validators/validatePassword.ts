import { Ref } from 'vue';

/**
 * Ensure that the provided value is a valid password, and optionally matches the provided field.
 *
 * @param repeat The password ref to compare against.
 * @returns A function that may be used to validate a password and a repeat password.
 */
export default function validatePassword(
  repeat?: Ref<string>
): (value: string) => string | boolean {
  return (value: string) => {
    if (!value) {
      return 'Password is required.';
    }

    if (value.trim().length < 8) {
      return 'Password must be at least 8 characters in length.';
    }

    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one digit.';
    }

    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter.';
    }

    if (!/[^a-zA-Z\d]/.test(value)) {
      return 'Password must contain at least one special character.';
    }

    // Magic happens here whereby the input of repeat triggers this to run again!
    if (!repeat) return true;
    if (!repeat.value || value !== repeat.value) {
      return 'Passwords do not match.';
    }

    return true;
  };
}
