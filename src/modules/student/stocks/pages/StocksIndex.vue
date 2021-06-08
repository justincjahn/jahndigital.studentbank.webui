<template>
  Stocks, man.

  <ul>
    <li v-for="stock in stocksHeld" :key="stock.id">
      {{ stock }}
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';

import userStore from '@/store/user';
import errorStore from '@/store/error';

import injectStrict from '@/utils/injectStrict';
import { GLOBAL_STORE } from '../../symbols';

export default defineComponent({
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);

    // Fetch held stocks when the student's ID changes or they login
    watch(() => userStore.id.value, async (newId, oldId) => {
      if (newId !== -1 && oldId !== newId) {
        try {
          await globalStore.fetchStocksHeld({ studentId: newId });
        } catch (e) {
          errorStore.setCurrentError(e?.message ?? e);
        }
      }
    }, { immediate: true });

    return {
      ...globalStore,
    };
  },
});
</script>
