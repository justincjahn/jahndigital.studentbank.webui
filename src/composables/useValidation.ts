import { ref, computed } from 'vue';

type validationFunc = (value: string) => string | boolean;

/**
 * Provides a mechanism to validate a string value when it changes.
 *
 * @param {(string) => string|boolean}validator Function that checks the value.
 */
export default function useValidation(validator: validationFunc) {
  const value = ref('');

  const error = computed(() => {
    const isValid = validator(value.value);
    if (isValid === true) return '';
    return isValid;
  });

  return {
    value,
    error,
  };
}
