<script setup lang="ts">
import type { StudentStock } from '@/common/services/stock';
import type { StudentStockStore } from '@/student/common/stores/studentStock';

// Core
import { defineAsyncComponent, ref, toRef } from 'vue';

// Composables
import useGlobalStore from '@/student/common/composables/useGlobalStore';

// Utils
import Money from '@/common/utils/Money';

// Routes
import StockRouteNames from '@/student/stocks/routeNames';

const StockTransactionModal = defineAsyncComponent(
  () => import('@/student/stocks/components/StockTransactionModal.vue')
);

const props = defineProps<{
  store: StudentStockStore;
}>();

const globalStore = useGlobalStore();
const buyStock = ref(true);
const showStockModal = ref(false);
const loadingStockModal = ref(false);
const selectedStock = ref<StudentStock | null>(null);
const stocks = toRef(() => props.store.stocks.value);
const shares = toRef(() => globalStore.share.shares.value);

function worth(studentStock: StudentStock) {
  return Money.fromNumber(
    studentStock.stock.currentValue * studentStock.sharesOwned
  );
}

function position(studentStock: StudentStock) {
  return worth(studentStock).sub(
    Money.fromNumber(studentStock.netContribution)
  );
}

function handleStockPurchase(stock: StudentStock, buy: boolean) {
  buyStock.value = buy;
  selectedStock.value = stock;
  showStockModal.value = true;
}
</script>

<template>
  <div class="scroll-wrapper">
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Company</th>
          <th>Last Transaction</th>
          <th>Share Value</th>
          <th>Shares Held</th>
          <th>Total Value</th>
          <th>Net Contributions</th>
          <th>Position</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stock in stocks" :key="stock.id">
          <td>
            <router-link
              :to="{
                name: StockRouteNames.details,
                params: { id: stock.stockId },
              }"
            >
              {{ stock.stock.symbol }}
            </router-link>
          </td>
          <td>{{ stock.stock.name }}</td>
          <td>
            {{ new Date(stock.dateLastActive).toLocaleDateString() }}
            {{ new Date(stock.dateLastActive).toLocaleTimeString() }}
          </td>
          <td>{{ Money.fromNumber(stock.stock.currentValue) }}</td>
          <td>
            {{
              stock.sharesOwned.toLocaleString('en-US', {
                minimumFractionDigits: 0,
              })
            }}
          </td>
          <td>{{ worth(stock) }}</td>
          <td>{{ Money.fromNumber(stock.netContribution) }}</td>
          <td>{{ position(stock) }}</td>
          <td>
            <button type="button" @click="handleStockPurchase(stock, true)">
              Buy
            </button>
            <button type="button" @click="handleStockPurchase(stock, false)">
              Sell
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <suspense>
    <stock-transaction-modal
      :show="showStockModal"
      :loading="loadingStockModal"
      :buy="buyStock"
      :shares="shares"
      :holdings="selectedStock?.sharesOwned ?? -1"
      :stock="selectedStock?.stock ?? null"
      @cancel="showStockModal = false"
      @submit="showStockModal = false"
    />
  </suspense>
</template>

<style scoped>
th,
td {
  padding-inline: 1rem;
}

td:nth-child(1) {
  min-width: 12ch;
}

td:nth-child(2) {
  width: 100%;
}

td:where(:nth-child(3), :nth-child(7)) {
  min-width: 14ch;
}

td:where(:nth-child(4), :nth-child(5), :nth-child(6), :nth-child(8)) {
  min-width: 10ch;
}
</style>
