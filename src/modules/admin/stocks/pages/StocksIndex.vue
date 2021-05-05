<template>
  <stock-list
    @stock-dblclick="handleStockDoubleClick"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

// Components
import StockList from '../components/StockList.vue';

// Routes
import RouteNames from '../routeNames';

export default defineComponent({
  components: {
    StockList,
  },
  setup() {
    const router = useRouter();

    function handleStockDoubleClick(stock: Stock) {
      router.push({
        name: RouteNames.stockDetails,
        params: {
          id: stock.id,
        },
      });
    }

    return {
      handleStockDoubleClick,
    };
  },
});
</script>
