<script setup lang="ts">
import useGlobalStore from '@/student/common/composables/useGlobalStore';
import StudentStockList from '@/student/stocks/components/StudentStockList.vue';

const { studentStock: studentStockStore, user: userStore } = useGlobalStore();
studentStockStore.fetch({ cache: false, studentId: userStore.id.value });
</script>

<template>
  <div class="main-content container section | flow">
    <p class="help-text">
      Tip: Click on the stock symbol to view detailed pricing history.
    </p>

    <div :class="{ loading: studentStockStore.loading.value }">
      <student-stock-list :store="studentStockStore" />
    </div>
  </div>
</template>
