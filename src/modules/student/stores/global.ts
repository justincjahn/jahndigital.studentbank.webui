import { reactive, computed } from 'vue';

export function setup() {
  const store = reactive({
    selectedShare: null as Share | null,
    transactions: [] as Transaction[],
  });

  const selectedShare = computed({
    get: () => store.selectedShare,
    set: (value: Share | null) => {
      store.selectedShare = value;
    },
  });

  const transactions = computed(() => store.transactions);

  /**
   * Dispose of the store, unsubscribing from any observed events.
   */
  function dispose() { /* NOT IMPLEMENTED */ }

  return {
    selectedShare,
    transactions,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
