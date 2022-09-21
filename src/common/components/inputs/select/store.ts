import type { Ref } from 'vue';
import { computed, reactive } from 'vue';

export function setup(modelValue: Ref<unknown>) {
  const store = reactive({
    maxIndex: 0,
  });

  const maxIndex = computed({
    get() {
      return store.maxIndex;
    },

    set(val) {
      store.maxIndex = Math.max(store.maxIndex, val);
    },
  });

  return {
    modelValue,
    maxIndex,
  };
}

export type SelectStore = ReturnType<typeof setup>;
