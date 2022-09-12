import { ref, Ref, unref, watchEffect } from 'vue';

/**
 * Callback function passed to validator utilities to check input values.
 */
export type ValidationFunc = (
  value: string
) => string | boolean | Promise<string | boolean>;

/**
 * Function called to format a value before it's validated.
 */
export type DecoratorFunc = (value: string) => string;

/**
 * Options object passed to the useValidation function.
 */
export interface UseValidationOptions {
  decorator?: DecoratorFunc | Ref<DecoratorFunc>;
  value?: Ref<string>;
  immediate?: boolean;
}

/**
 * Provides a mechanism to validate a string value when it changes.
 *
 * @param validator
 * @param options
 */
export default function useValidation(
  validator: ValidationFunc | Ref<ValidationFunc>,
  options?: UseValidationOptions
): {
  value: Ref<string>;
  error: Ref<string>;
  loading: Ref<boolean>;
} {
  const opts = options || {};
  const value = opts?.value ?? ref('');
  const error = ref<string>('');
  const loading = ref(false);
  let initialValidation = true;

  async function runValidation(newValue: string) {
    if (initialValidation) {
      initialValidation = false;

      if (!(options?.immediate ?? false)) {
        return;
      }
    }

    // Run the value through a decorator if provided
    let val = newValue;
    if (opts.decorator) {
      val = unref(opts.decorator)(val);
    }

    loading.value = true;
    const isValid = await Promise.resolve(unref(validator)(val));
    loading.value = false;

    if (isValid === true) {
      error.value = '';
      return;
    }

    if (isValid === false) {
      error.value = 'An unknown error occurred.';
      return;
    }

    error.value = isValid;
  }

  watchEffect(() => {
    if (unref(validator)) {
      runValidation(value.value);
    }
  });

  return {
    value,
    error,
    loading,
  };
}
