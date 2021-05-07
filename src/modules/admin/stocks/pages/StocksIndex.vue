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
      >
        Link Selected
      </button>
      <button
        type="button"
        :disabled="!isLinked || !selected"
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
        <h2>Linked Stocks</h2>
        <stock-list
          :selected="selected"
          @stock-dblclick="handleStockDoubleClick"
          @stock-click="handleStockClick"
        />

        <h2>Available Stocks</h2>
        <stock-list
          :selected="selected"
          :available="true"
          @stock-dblclick="handleStockDoubleClick"
          @stock-click="handleStockClick"
        />
      </section>
      <section class="stocks-index__sidebar">
        <stock-history-list :selected="selected" class="stocks-index__history" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

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
    const selected = ref<Stock|null>(null);
    const instanceStore = injectStrict(INSTANCE_STORE_SYMBOL);

    const isLinked = computed(() => {
      if (!selected.value) return false;
      const instances = selected.value.stockInstances.map((x) => x.instanceId);
      const instanceId = instanceStore.selected.value?.id ?? -1;
      return instances.includes(instanceId);
    });

    function handleStockClick(stock: Stock) {
      if (selected.value === stock) {
        selected.value = null;
      } else {
        selected.value = stock;
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

    return {
      selected,
      isLinked,
      handleStockClick,
      handleStockDoubleClick,
    };
  },
});
</script>

<style lang="scss">
  .stocks-index {
    display: flex;
    flex-direction: column;
    gap: 1rem;

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

    &__history {
      @include round-border;
    }

    @media screen and (min-width: 900px) {
      &__body {
        flex-direction: row;
        align-items: flex-start;
      }
    }
  }
</style>
