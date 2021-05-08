<template>
  <div class="stocks-index">
    <section class="stocks-index__toolbar">
      <button
        type="button"
      >
        New Stock
      </button>
      <button
        type="button"
        :disabled="isLinked || !selected"
        @click="handleLink"
      >
        Link Selected
      </button>
      <button
        type="button"
        :disabled="!isLinked || !selected"
        @click="handleUnlink"
      >
        Unlink Selected
      </button>
      <button
        type="button"
        :disabled="!selected || isLinked"
      >
        Delete Selected
      </button>
    </section>
    <div class="stocks-index__body">
      <section class="stocks-index__main">
        <h2>Linked</h2>
        <stock-list
          :selected="selected"
          @stock-dblclick="handleStockDoubleClick"
          @stock-click="handleStockClick"
        />

        <h2>Available</h2>
        <stock-list
          :selected="selected"
          :available="true"
          @stock-dblclick="handleStockDoubleClick"
          @stock-click="handleStockClick"
        />
      </section>
      <section class="stocks-index__sidebar">
        <h2>History</h2>
        <stock-history-list
          class="stocks-index__history"
          :selected="selected"
        />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';

// Stores
import errorStore from '@/store/error';
import { setup as defineStockStore } from '@/store/stock';

// Utils
import injectStrict from '@/utils/injectStrict';
import { INSTANCE_STORE_SYMBOL } from '../../symbols';

// Components
import StockList from '../components/StockList.vue';
import StockHistoryList from '../components/StockHistoryList.vue';

// Routes
import RouteNames from '../routeNames';

export default defineComponent({
  components: {
    StockList,
    StockHistoryList,
  },
  setup() {
    const router = useRouter();
    const instanceStore = injectStrict(INSTANCE_STORE_SYMBOL);
    const stockStore = defineStockStore();

    const isLinked = computed(() => {
      if (!stockStore.selected.value) return false;
      const instances = stockStore.selected.value.stockInstances.map((x) => x.instanceId);
      const instanceId = instanceStore.selected.value?.id ?? -1;
      return instances.includes(instanceId);
    });

    function handleStockClick(stock: Stock) {
      if (stockStore.selected.value === stock) {
        stockStore.selected.value = null;
      } else {
        stockStore.selected.value = stock;
      }
    }

    function handleStockDoubleClick(stock: Stock) {
      router.push({
        name: RouteNames.stockDetails,
        params: {
          id: stock.id,
        },
      });
    }

    async function handleLink() {
      if (!instanceStore.selected.value) return;
      if (!stockStore.selected.value) return;

      try {
        await stockStore.link({
          stockId: stockStore.selected.value.id,
          instanceId: instanceStore.selected.value.id,
        });

        stockStore.selected.value = null;
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }
    }

    async function handleUnlink() {
      if (!instanceStore.selected.value) return;
      if (!stockStore.selected.value) return;

      try {
        await stockStore.unlink({
          stockId: stockStore.selected.value.id,
          instanceId: instanceStore.selected.value.id,
        });

        stockStore.selected.value = null;
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }
    }

    return {
      selected: stockStore.selected,
      isLinked,
      handleStockClick,
      handleStockDoubleClick,
      handleLink,
      handleUnlink,
    };
  },
});
</script>

<style lang="scss">
  .stocks-index {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h2 {
      margin-bottom: 0.5em;
    }

    &__toolbar {
      padding: 1em;
      background-color: colorStep(secondary);
    }

    &__body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin: 0 1rem;
    }

    &__main {
      width: 100%;

      .stock-list {
        margin-bottom: 1rem;
      }
    }

    &__sidebar {
      width: 100%;
    }

    @media screen and (min-width: 900px) {
      &__body {
        flex-direction: row;
        align-items: flex-start;
      }
    }
  }
</style>
