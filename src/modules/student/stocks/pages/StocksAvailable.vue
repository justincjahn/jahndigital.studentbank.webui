<template>
  <table
    v-if="stocks.length > 0 || loading"
    class="available-stocks-list"
    :class="{ loading }"
  >
    <thead>
      <tr>
        <th class="left">
          Symbol
        </th>
        <th class="center">
          Name
        </th>
        <th class="right">
          Price
        </th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="stock in stocks" :key="stock.id">
        <td>
          {{ stock.symbol }}
        </td>
        <td class="center">
          {{ stock.name }}
        </td>
        <td class="right">
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
        <td>
          <button class="secondary">
            Buy
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <p v-else-if="!loading" class="center">
    No stocks available.
  </p>

  <div
    v-if="pages > 1"
    class="pagination-buttons"
  >
    <button
      :disabled="!hasPrevious"
      @click.passive="fetchPrevious"
    >
      Previous
    </button>

    <button
      :disabled="!hasNext"
      @click.passive="fetchNext"
    >
      Next
    </button>
  </div>
</template>

<script lang="ts">
import injectStrict from '@/utils/injectStrict';
import { defineComponent, onMounted } from 'vue';
import { GLOBAL_STORE } from '../../symbols';

export default defineComponent({
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);

    onMounted(() => {
      globalStore.fetchStocksAvailable();
    });

    return {
      loading: globalStore.stocksAvailableLoading,
      stocks: globalStore.stocksAvailable,
      hasNext: globalStore.stocksAvailableHasNextPage,
      hasPrevious: globalStore.stocksAvailableHasPreviousPage,
      pages: globalStore.stocksAvailableTotalPages,
      fetchNext: globalStore.fetchNextStocksAvailable,
      fetchPrevious: globalStore.fetchPreviousStocksAvailable,
    };
  },
});
</script>

<style lang="scss">
.available-stocks-list {
  padding: 0 1em;
}
</style>
