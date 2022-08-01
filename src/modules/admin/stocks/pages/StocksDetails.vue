<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';

// Utils
import injectStrict from '@/utils/injectStrict';

// Symbols
import { GLOBAL_STORE } from '../../symbols';

const router = useRouter();
const globalStore = injectStrict(GLOBAL_STORE);
const stock = ref<Stock|null>(null);
const loading = ref(false);

const stockId = computed(() => {
  if (router.currentRoute.value.params.id) {
    const id = parseInt(
      Array.isArray(router.currentRoute.value.params.id)
        ? router.currentRoute.value.params.id[0]
        : router.currentRoute.value.params.id,
      10,
    );

    if (Number.isNaN(id)) return undefined;
    return id;
  }

  return undefined;
});

watchEffect(async () => {
  if (typeof stockId.value === 'undefined') {
    return;
  }

  loading.value = true;
  stock.value = await globalStore.stock.getById(stockId.value);
  console.log(stock.value);
  loading.value = false;
});
</script>

<template>
  <template v-if="!loading">
    <h1>{{stock?.name}} ({{stock?.symbol}})</h1>
    <div v-html="stock?.formattedDescription" />
  </template>
  <template v-else>
    <loading-label />
  </template>
</template>
