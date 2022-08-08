import { validationFunc } from '@/types';
import { ref, Ref, unref, watchEffect } from 'vue';

type decoratorFunc = (value: string) => string;
export type ReactiveFunction<TParam> = () => TParam

export interface UseValidationOptions {
  decorator?: decoratorFunc | Ref<decoratorFunc>;
  value?: Ref<string>;
}

/**
 * Provides a mechanism to validate a string value when it changes.
 *
 * @param {(string) => string|boolean|Promise<string|boolean>} validator Function that checks the value.
 * @param {UseValidationOptions} options
 */
export default function useValidation(
  validator: validationFunc | Ref<validationFunc>,
  options?: UseValidationOptions,
): {
  value: Ref<string>,
  error: Ref<string>,
  loading: Ref<boolean>,
} {
  const opts = options || {};
  const value = opts?.value ?? ref('');
  const error = ref<string>('');
  const loading = ref(false);

  async function runValidation(newValue: string) {
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
