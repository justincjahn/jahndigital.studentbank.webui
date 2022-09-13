import { computed, reactive } from 'vue';

/**
 * Stores information about errors encountered in the system.
 */
export function setup() {
  const store = reactive({
    error: null as string | null,
  });

  // Get or set the current error
  const error = computed({
    get() {
      return store.error;
    },

    set(value) {
      store.error = value;
    },
  });

  return {
    error,
  };
}

const store = setup();
export type ErrorStore = ReturnType<typeof setup>;
export default store;
