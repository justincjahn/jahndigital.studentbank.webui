import { computed, reactive } from 'vue';
import { newError } from '@/common/events';
import { publish } from '@/common/services/eventBus';

/**
 * Stores information about errors encountered in the system.
 */
export function setup() {
  const store = reactive({
    error: null as string | null,
  });

  // Get the current error
  const error = computed(() => store.error);

  /**
   * Set the current error message.
   *
   * @param val The error message
   */
  function setCurrentError(val: string | null = null) {
    store.error = val;
    publish(newError, val);
  }

  return {
    error,
    setCurrentError,
  };
}

const store = setup();
export type ErrorStore = ReturnType<typeof setup>;
export default store;
