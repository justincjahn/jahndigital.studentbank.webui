<script setup lang="ts">
// Types
import type { Share } from '@/common/services/share';

// Core
import { defineAsyncComponent, computed, ref, watch, watchEffect } from 'vue';

// Stores
import { setup as setupTransactionStore } from '@/common/stores/transaction';

// Utils
import injectStrict from '@/common/utils/injectStrict';

// Symbols
import { GLOBAL_STORE } from '@/admin/symbols';

const ShareSelector = defineAsyncComponent(
  () => import('@/common/components/ShareSelector.vue')
);

const TransactionList = defineAsyncComponent(
  () => import('@/admin/students/components/TransactionList.vue')
);

const globalStore = injectStrict(GLOBAL_STORE);
const transactionStore = setupTransactionStore();

const selectedStudent = computed({
  get() {
    return globalStore.student.selected.value;
  },

  set(value) {
    globalStore.student.selected.value = value;
  },
});

const selectedShare = ref<Share | null>(null);

function handleRefresh() {
  if (selectedShare.value === null) return;

  transactionStore.fetch({
    shareId: selectedShare.value.id,
    cache: false,
  });
}

// When the selected student changes, clear the selected shares.
watch(
  () => selectedStudent.value,
  () => {
    selectedShare.value = null;
  }
);

// When the selected share changes, fetch transactions
watchEffect(() => {
  if (selectedShare.value === null) {
    transactionStore.clear();
  } else {
    transactionStore.fetch({
      shareId: selectedShare.value.id,
    });
  }
});
</script>

<template>
  <div v-if="selectedStudent !== null" class="wrapper">
    <div class="tool-strip">
      <suspense>
        <share-selector
          v-model="selectedShare"
          :shares="selectedStudent.shares"
          class="share-selector inline"
        />
      </suspense>

      <button
        type="button"
        :disabled="selectedShare === null"
        @click="handleRefresh"
      >
        Refresh
      </button>
    </div>

    <suspense>
      <transaction-list class="transaction-list" :store="transactionStore" />
    </suspense>
  </div>
</template>

<style scoped>
.wrapper {
  margin-inline: 1rem;
}

.tool-strip {
  margin-block: 1rem;
}
</style>
