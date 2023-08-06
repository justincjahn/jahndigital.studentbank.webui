<script setup lang="ts">
import { defineAsyncComponent, ref, computed, watchEffect } from 'vue';

// Utils
import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/admin/symbols';

// Components
const StockList = defineAsyncComponent(
  () => import('@/admin/stocks/components/StockList.vue')
);

const AddLinkStocksModal = defineAsyncComponent(
  () => import('@/admin/stocks/components/AddLinkStocksModal.vue')
);

enum ModalState {
  ADD,
}

const globalStore = injectStrict(GLOBAL_STORE);
const modalState = ref<ModalState | null>(null);

const selected = computed({
  get: () => globalStore.stock.selected.value,
  set(value) {
    globalStore.stock.selected.value = value;
  },
});

watchEffect(() => {
  globalStore.stock.fetch(undefined);
});
</script>

<template>
  <div class="sub-menu">
    <button type="button" @click="modalState = ModalState.ADD">
      New Stock
    </button>
  </div>

  <h1>Linked Stocks</h1>
  <suspense>
    <stock-list v-model="selected" :stocks="globalStore.stock.stocks.value" />
  </suspense>

  <suspense>
    <add-link-stocks-modal
      :show="modalState === ModalState.ADD"
      :store="globalStore"
      @submit="modalState = null"
    />
  </suspense>
</template>

<style scoped>
.loading {
  opacity: 0.4;
}
</style>
