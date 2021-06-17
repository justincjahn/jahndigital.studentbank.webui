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
          <button
            class="secondary"
            @click.passive="handlePurchaseShow(stock)"
          >
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

  <stock-purchase-modal
    :show="showPurchaseModal"
    :loading="purchaseLoading"
    :stock="purchaseSelectedStock"
    :shares="shares"
    @ok="handlePurchaseOk"
    @cancel="handlePurchaseCancel"
  />
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, onMounted } from 'vue';

// Utils
import injectStrict from '@/utils/injectStrict';

// Services
import { newStockPurchase } from '@/services/transaction';

// Stores
import errorStore from '@/store/error';
import userStore from '@/store/user';
import { GLOBAL_STORE } from '../../symbols';

export default defineComponent({
  components: {
    StockPurchaseModal: defineAsyncComponent(() => import('../components/StockPurchaseModal.vue')),
  },
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);

    const showPurchaseModal = ref(false);

    const purchaseLoading = ref(false);

    const purchaseSelectedStock = ref<Stock|null>(null);

    async function handlePurchaseShow(stock: Stock) {
      purchaseSelectedStock.value = stock;
      showPurchaseModal.value = true;

      try {
        purchaseLoading.value = true;
        await globalStore.fetchShares(userStore.id.value, false);
      } finally {
        purchaseLoading.value = false;
      }
    }

    async function handlePurchaseOk({ shareId, quantity }: { shareId: number; quantity: number }) {
      if (!purchaseSelectedStock.value) return;

      try {
        purchaseLoading.value = true;

        await newStockPurchase({
          shareId,
          stockId: purchaseSelectedStock.value.id,
          quantity,
        });

        showPurchaseModal.value = false;
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        purchaseLoading.value = false;
      }
    }

    function handlePurchaseCancel() {
      showPurchaseModal.value = false;
    }

    onMounted(() => {
      globalStore.fetchStocksAvailable();
    });

    return {
      loading: globalStore.stocksAvailableLoading,
      shares: globalStore.shares,
      stocks: globalStore.stocksAvailable,
      hasNext: globalStore.stocksAvailableHasNextPage,
      hasPrevious: globalStore.stocksAvailableHasPreviousPage,
      pages: globalStore.stocksAvailableTotalPages,
      fetchNext: globalStore.fetchNextStocksAvailable,
      fetchPrevious: globalStore.fetchPreviousStocksAvailable,

      showPurchaseModal,
      purchaseLoading,
      purchaseSelectedStock,
      handlePurchaseShow,
      handlePurchaseOk,
      handlePurchaseCancel,
    };
  },
});
</script>

<style lang="scss">
.available-stocks-list {
  padding: 0 1em;
}
</style>
