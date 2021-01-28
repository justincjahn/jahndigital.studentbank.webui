import { computed, reactive } from 'vue';

/**
 * Stores information about modal windows and their order.
 */
export function setup() {
  const store = reactive({
    open: [] as HTMLElement[],
  });

  // GETs the list of opened modals
  const opened = computed(() => store.open);

  // GETs the topmost modal
  const topmost = computed(() => {
    if (store.open.length === 0) return null;
    return store.open[store.open.length - 1];
  });

  // Open the provided modal
  function open(el: HTMLElement) {
    const index = store.open.findIndex((x: HTMLElement) => x === el);
    if (index < 0) store.open = [...store.open, el];
  }

  // Close the provided modal
  function close(el: HTMLElement) {
    const index = store.open.findIndex((x) => x === el);
    if (index < 0) return;
    store.open = store.open.filter((x) => x !== el);
  }

  return {
    opened,
    topmost,
    open,
    close,
  };
}

const store = setup();
export type ModalStore = ReturnType<typeof setup>;
export default store;
