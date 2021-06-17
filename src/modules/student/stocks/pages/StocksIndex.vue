<template>
  <table
    v-if="stocks.length > 0 || loading"
    class="held-stocks-list"
    :class="{ loading }"
  >
    <thead>
      <tr>
        <th>
          Name
        </th>
        <th>
          Symbol
        </th>
        <th>
          Last Purchase
        </th>
        <th class="center">
          Holdings
        </th>
        <th class="right">
          Share Value
        </th>
        <th class="right">
          Total
        </th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="stock in stocks" :key="stock.id">
        <td>{{ stock.stock.name }}</td>
        <td>{{ stock.stock.symbol }}</td>
        <td>
          {{ new Date(stock.dateLastActive).toLocaleDateString('en-US') }}
          {{ new Date(stock.dateLastActive).toLocaleTimeString('en-US') }}
        </td>
        <td class="center">
          {{
            stock.sharesOwned
              .toLocaleString('en-US', {minimumFractionDigits: 0})
          }}
        </td>
        <td class="right">
          {{
            new Intl.NumberFormat(
              'en-US',
              {
                style: 'currency',
                currency: 'USD',
              }
            ).format(stock.stock.currentValue)
          }}
        </td>
        <td class="right">
          {{
            new Intl.NumberFormat(
              'en-US',
              {
                style: 'currency',
                currency: 'USD',
              }
            ).format(worth(stock))
          }}
        </td>
        <td>
          <button
            class="secondary"
            @click="handlePurchaseShow(stock)"
          >
            Buy/Sell
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <p v-else-if="!loading" class="center">
    No stocks held yet.  Buy some!
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
import { defineComponent, defineAsyncComponent, ref, watch } from 'vue';

// Utils
import injectStrict from '@/utils/injectStrict';

// Services
import { newStockPurchase } from '@/services/transaction';

// Stores
import userStore from '@/store/user';
import errorStore from '@/store/error';
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

    async function handlePurchaseShow(studentStock: StudentStock) {
      purchaseSelectedStock.value = studentStock.stock;
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

      try {
        await globalStore.fetchStocksHeld({ studentId: userStore.id.value });
      } catch (e) {
        errorStore.setCurrentError('Unable to refresh holdings, please try again later.');
      }
    }

    function handlePurchaseCancel() {
      showPurchaseModal.value = false;
    }

    function worth(studentStock: StudentStock) {
      return studentStock.stock.currentValue * studentStock.sharesOwned;
    }

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
      loading: globalStore.stocksHeldLoading,
      shares: globalStore.shares,
      stocks: globalStore.stocksHeld,
      hasNext: globalStore.stocksHeldHasNextPage,
      hasPrevious: globalStore.stocksHeldHasPreviousPage,
      pages: globalStore.stocksHeldTotalPages,
      fetchNext: globalStore.fetchNextStocksHeld,
      fetchPrevious: globalStore.fetchPreviousStocksHeld,

      showPurchaseModal,
      purchaseLoading,
      purchaseSelectedStock,
      worth,
      handlePurchaseShow,
      handlePurchaseOk,
      handlePurchaseCancel,
    };
  },
});
</script>

<style lang="scss">
.held-stocks-list {
  padding: 0 2em;
}
</style>
