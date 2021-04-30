import { ref, computed, Ref, isRef } from 'vue';

type validationFunc = (value: string) => string | boolean;
type decoratorFunc = (value: string) => string;

/**
 * Provides a mechanism to validate a string value when it changes.
 *
 * @param {(string) => string|boolean}validator Function that checks the value.
 */
export default function useValidation(validator: validationFunc | Ref<validationFunc>, decorator?: decoratorFunc | Ref<decoratorFunc>) {
  // The value to validate when it changes
  const value = ref('');

  // Compute error every time the value (or validator) changes
  const error = computed(() => {
    // Run the value through a decorator if provided
    let val = value.value;
    if (decorator) {
      val = isRef(decorator) ? decorator.value(val) : decorator(val);
    }

    // Run the value through the validation function
    const func = isRef(validator) ? validator.value : validator;
    const isValid = func(val);

    // Normalize the error into a string and return
    if (isValid === true) return '';
    if (isValid === false) return 'An unknown error occurred.';
    return isValid;
  });

  return {
    value,
    error,
  };
}
