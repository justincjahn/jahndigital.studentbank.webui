<script setup lang="ts">
import type { Stock } from '@/common/services/stock';

// Core
import { ref, toRef, computed } from 'vue';
import { useRoute } from 'vue-router';

// Stores
import { setup as setupStockHistoryStore } from '@/student/stocks/stores/stockHistory';

// Composables
import useGlobalStore from '@/student/common/composables/useGlobalStore';

// Components
import LoadingPage from '@/common/pages/LoadingPage.vue';
import StockHistoryList from '@/student/stocks/components/StockHistoryList.vue';

const router = useRoute();

const stockId = toRef(() => {
  const id = Array.isArray(router.params.id)
    ? +router.params.id[0]
    : +router.params.id;

  return Number.isNaN(id) ? -1 : id;
});

const globalStore = useGlobalStore();

const stockHistoryStore = setupStockHistoryStore();
const historyLoading = toRef(() => stockHistoryStore.loading.value);

const stockLoading = ref(false);
const stock = ref<Stock | null>(null);

const description = computed(() =>
  stock.value?.formattedDescription
    ? stock.value.formattedDescription
    : 'No description available.'
);

async function fetchById() {
  if (stockId.value > 0) {
    stockLoading.value = true;

    try {
      stock.value = await globalStore.stock.findById(stockId.value);
    } catch (e) {
      if (e instanceof Error) {
        globalStore.error.setCurrentError(e.message);
      }
    } finally {
      stockLoading.value = false;
    }

    try {
      await stockHistoryStore.fetch({
        stockId: stockId.value,
      });
    } catch (e) {
      if (e instanceof Error) {
        globalStore.error.setCurrentError(e.message);
      }
    }
  }
}

fetchById();
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="container section flow" :class="{ loading: stockLoading }">
    <LoadingPage v-if="stockLoading" />
    <template v-else>
      <h2 class="size-xl">{{ stock?.name ?? 'Loading...' }}</h2>
      <div v-html="description" />

      <div :class="{ loading: historyLoading }">
        <stock-history-list :store="stockHistoryStore" />
      </div>
    </template>
  </div>
</template>
