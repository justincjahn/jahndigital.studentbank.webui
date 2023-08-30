<script setup lang="ts">
import { watch, watchEffect } from 'vue';
import useGlobalStore from '@/student/common/composables/useGlobalStore';
import { setup as setupTransactionStore } from '@/common/stores/transaction';

// NOTE: We want to preload this page because it's the default no async components
import ShareList from '@/student/accounts/components/ShareList.vue';
import TransactionList from '@/admin/students/components/TransactionList.vue';

const globalStore = useGlobalStore();
const transactionStore = setupTransactionStore();
transactionStore.pageSize.value = 15;

// Always make sure a share is selected.
watchEffect(() => {
  const { selected, shares } = globalStore.share;

  if (selected.value === null && shares.value.length > 0) {
    [selected.value] = shares.value;
  }
});

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
  <div class="main-content | container">
    <share-list
      :store="globalStore"
      @select="(share) => (globalStore.share.selected.value = share)"
    />

    <div v-if="globalStore.share.selected.value" class="section">
      <h2 class="size-xl">Recent Transactions</h2>
      <transaction-list :store="transactionStore" />
    </div>
  </div>
</template>
