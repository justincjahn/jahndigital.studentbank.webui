import { computed, reactive } from 'vue';

/**
 * Stores information about errors encountered in the system.
 */
export function setup() {
  const store = reactive({
    error: null as string | null,
  });

  // GETs the current error
  const error = computed(() => store.error);

  // SETs the current error
  function setCurrentError(e: string | null) {
    store.error = e;
  }

  return {
    error,
    setCurrentError,
  };
}

const store = setup();
export type ErrorStore = ReturnType<typeof setup>;
export default store;
