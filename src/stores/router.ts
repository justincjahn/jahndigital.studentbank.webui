import { reactive, computed } from 'vue';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setup() {
  const store = reactive({
    loading: true,
  });

  const loading = computed(() => store.loading);

  function setLoading(state: boolean) {
    store.loading = state;
  }

  return {
    loading,
    setLoading,
  };
}

const store = setup();
export type RouterStore = ReturnType<typeof setup>;
export default store;
