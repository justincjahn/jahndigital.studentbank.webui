import { validationFunc } from '@/types';
import { ref, Ref, ComputedRef, isRef, watch } from 'vue';

type decoratorFunc = (value: string) => string;

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
  validator: validationFunc | Ref<validationFunc> | ComputedRef<validationFunc>,
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
      val = isRef(opts.decorator) ? opts.decorator.value(val) : opts.decorator(val);
    }

    const func = isRef(validator) ? validator.value : validator;
    loading.value = true;
    const isValid = await Promise.resolve(func(val));
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

  watch(validator, () => {
    runValidation(value.value);
  });

  watch(value, async (newValue, oldValue) => {
    if (newValue === oldValue) return;
    await runValidation(newValue);
  }, { immediate: true });

  return {
    value,
    error,
    loading,
  };
}
