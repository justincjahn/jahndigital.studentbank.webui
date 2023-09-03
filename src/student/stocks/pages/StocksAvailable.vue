<script setup lang="ts">
import useGlobalStore from '@/student/common/composables/useGlobalStore';
import StockList from '@/student/stocks/components/StockList.vue';

const { stock: stockStore } = useGlobalStore();
stockStore.fetch({ cache: false });
</script>

<template>
  <div class="main-content container section | flow">
    <p class="help-text">
      Tip: Click on the stock symbol to view detailed pricing history.
    </p>

    <div :class="{ loading: stockStore.loading.value }">
      <stock-list :store="stockStore" />
    </div>
  </div>
</template>
