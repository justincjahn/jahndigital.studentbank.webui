<template>
  <div v-if="stocks.length > 0" class="stock-list">
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Name</th>
          <th>Available Shares</th>
          <th>Total Shares</th>
          <th>Current Value</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="stock in stocks"
          :key="stock.id"
          @click="handleStockClick(stock)"
        >
          <td>{{ stock.symbol }}</td>
          <td>{{ stock.name }}</td>
          <td>{{ stock.availableShares }}</td>
          <td>{{ stock.totalShares }}</td>
          <td>
            {{
              new Intl.NumberFormat(
                'en-US',
                {
                  style: 'currency',
                  currency: 'USD',
                }
              ).format(stock.currentValue)
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';

// Utils
import injectStrict from '@/utils/injectStrict';

// Stores
import { INSTANCE_STORE_SYMBOL } from '@/modules/admin/symbols';
import { setup as defineStockStore } from '@/store/stock';

const delay = 300;
let timer: number|null = null;

export default defineComponent({
  emits: [
    'stock-dblclick',
  ],
  setup(_, { emit }) {
    const stockStore = defineStockStore();
    const instanceStore = injectStrict(INSTANCE_STORE_SYMBOL);
    const prevClicked = ref<Stock|null>(null);
    const clickCount = ref(0);

    /**
     * When the user double-clicks on a specific stock, emit an event to the parent.
     */
    function handleStockClick(stock: Stock) {
      clickCount.value += 1;

      if (clickCount.value === 1) {
        timer = setTimeout(() => { clickCount.value = 0; }, delay);
        prevClicked.value = stock;
      } else {
        if (timer == null) return;
        if (prevClicked.value === stock) {
          clearTimeout(timer);
          clickCount.value = 0;
          emit('stock-dblclick', stock);
        }
      }
    }

    watchEffect(() => {
      if (instanceStore.selected !== null) {
        stockStore.fetch();
      }
    });

    return {
      ...stockStore,
      handleStockClick,
    };
  },
});
</script>

<style lang="scss">
.stock-list {
  margin: 0 1em;

  table {
    @include table($border: false);
  }
}
</style>
