<script setup lang="ts">
import { defineAsyncComponent, watch } from 'vue';
import useGlobalStore from '@/student/common/composables/useGlobalStore';
import { setup as setupTransactionStore } from '@/common/stores/transaction';

import LoadingPage from '@/common/pages/LoadingPage.vue';

const ShareList = defineAsyncComponent(
  () => import('@/student/accounts/components/ShareList.vue')
);

const TransactionList = defineAsyncComponent(
  () => import('@/student/accounts/components/TransactionList.vue')
);

const globalStore = useGlobalStore();
const transactionStore = setupTransactionStore();
transactionStore.pageSize.value = 15;

watch(
  () => globalStore.share.selected.value,
  (newValue) => {
    if (!newValue) {
      transactionStore.clear();
    } else {
      transactionStore.fetch({
        shareId: newValue.id,
        cache: false,
      });
    }
  }
);
</script>

<template>
  <suspense>
    <share-list
      :store="globalStore"
      @select="(share) => (globalStore.share.selected.value = share)"
    />

    <template #fallback>
      <loading-page />
    </template>
  </suspense>

  <div v-if="globalStore.share.selected.value" class="section">
    <h2>Recent Transactions</h2>

    <suspense>
      <transaction-list :store="transactionStore" />

      <template #fallback>
        <loading-page />
      </template>
    </suspense>
  </div>
</template>
