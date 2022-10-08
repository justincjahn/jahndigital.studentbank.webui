import type { Ref } from 'vue';
import { ref } from 'vue';

/**
 * The function to call.
 */
export type Procedure = (...args: any[]) => void;

/**
 * Wraps a function to prevent it being called more than once during the specified amount of time.
 *
 * @param f The function to wrap.
 * @param waitMilliseconds The number of milliseconds to wait between calls.
 * @param options Options object.
 * @returns A function that should be called instead of the original function.
 */
export default function useDebounce<F extends Procedure>(
  f: F | Ref<F>,
  waitMilliseconds = 50
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  /**
   * Wraps the function call to debounce it according to waitMilliseconds function.
   */
  function call(this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;
    const func = ref(f);

    const doLater = () => {
      timeoutId = undefined;
      func.value.apply(context, args);
    };

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(doLater, waitMilliseconds);
  }

  return call;
}
