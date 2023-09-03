<script setup lang="ts">
import type { StockStore } from '@/student/common/stores/stock';
import type { Stock } from '@/common/services/stock';
import { ref, toRef } from 'vue';
import Money from '@/common/utils/Money';
import StockRouteNames from '@/student/stocks/routeNames';
import useGlobalStore from '@/student/common/composables/useGlobalStore';
import StockTransactionModal from './StockTransactionModal.vue';

const props = defineProps<{
  store: StockStore;
}>();

const globalStore = useGlobalStore();
const showModal = ref(false);
const loadingModal = ref(false);
const selectedStock = ref<Stock | null>(null);
const stocks = toRef(() => props.store.stocks.value);
const shares = toRef(() => globalStore.share.shares.value);

function handleStockPurchase(stock: Stock) {
  selectedStock.value = stock;
  showModal.value = true;
}
</script>

<template>
  <div class="scroll-wrapper">
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Company</th>
          <th>Price</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stock in stocks" :key="stock.id">
          <td>
            <router-link
              :to="{ name: StockRouteNames.details, params: { id: stock.id } }"
            >
              {{ stock.symbol }}
            </router-link>
          </td>
          <td>{{ stock.name }}</td>
          <td>{{ Money.fromNumber(stock.currentValue) }}</td>
          <td>
            <button type="button" @click="handleStockPurchase(stock)">
              Buy
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="store.totalPages.value > 1" class="pagination-buttons">
    <button
      type="button"
      :disabled="!store.hasPreviousPage.value"
      @click.passive="store.fetchPrevious"
    >
      Previous
    </button>

    <button
      type="button"
      :disabled="!store.hasNextPage.value"
      @click.passive="store.fetchNext"
    >
      Next
    </button>
  </div>

  <suspense>
    <stock-transaction-modal
      :show="showModal"
      :loading="loadingModal"
      :stock="selectedStock"
      :shares="shares"
      @cancel="showModal = false"
      @submit="showModal = false"
    />
  </suspense>
</template>

<style scoped>
td:nth-child(1) {
  min-width: 10ch;
}

td:nth-child(2) {
  width: 100%;
}

td:nth-child(3) {
  min-width: 12ch;
}
</style>
