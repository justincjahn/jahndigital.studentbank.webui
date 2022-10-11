import { ref, Ref, unref, watchEffect } from 'vue';

/**
 * Callback function passed to validator utilities to check input values.
 */
export type ValidationFunc<T = string> = (
  value: T | null
) => string | boolean | Promise<string | boolean>;

/**
 * Function called to format a value before it's validated.
 */
export type DecoratorFunc<T = string> = (value: T | null) => T | null;

/**
 * Options object passed to the useValidation function.
 */
export interface UseValidationOptions<T = string> {
  decorator?: DecoratorFunc<T> | Ref<DecoratorFunc<T>>;
  value?: Ref<T | null>;
  error?: Ref<string>;
  immediate?: boolean;
}

/**
 * Provides a mechanism to validate a string value when it changes.
 *
 * @param validator
 * @param options
 */
export default function useValidation<T = string>(
  validator: ValidationFunc<T> | Ref<ValidationFunc<T>>,
  options?: UseValidationOptions<T>
): {
  value: Ref<T | null>;
  error: Ref<string>;
  loading: Ref<boolean>;
} {
  const opts = options || {};
  const value = opts?.value ?? (ref(null) as Ref<T | null>);
  const error = opts?.error ?? ref('');
  const loading = ref(false);
  let initialValidation = true;

  async function runValidation(newValue: T | null) {
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
