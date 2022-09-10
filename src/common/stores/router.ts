import { toRef, reactive } from 'vue';

/**
 * Stores information about the state of the router.
 */
export function setup() {
  const store = reactive({
    loading: true,
  });

  return {
    loading: toRef(store, 'loading'),
  };
}

const store = setup();
export type RouterStore = ReturnType<typeof setup>;
export default store;
