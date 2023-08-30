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

const NewTransactionModal = defineAsyncComponent(
  () => import('@/admin/students/components/NewTransactionModal.vue')
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
const modalState = ref(false);

function handleRefresh() {
  if (selectedShare.value === null) return;

  transactionStore.fetch({
    shareId: selectedShare.value.id,
    cache: false,
  });
}

function handleNewTransaction() {
  modalState.value = !modalState.value;
}

// When the instance changes, clear the selected student
watch(
  () => globalStore.instance.selected.value,

  () => {
    selectedStudent.value = null;
  }
);

// When the selected student changes, clear or update the selected share.
watch(
  () => selectedStudent.value,

  (newValue, oldValue) => {
    if (newValue !== null && selectedShare.value !== null) {
      const selectedShareId = selectedShare.value.id;

      const newShare = newValue.shares.find(
        (share) => share.id === selectedShareId
      );

      if (newShare) {
        selectedShare.value = newShare;
      }
    }

    if (newValue?.id === oldValue?.id) return;
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
      cache: false,
    });
  }
});
</script>

<template>
  <div v-if="selectedStudent !== null" class="main-content">
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

      <button
        type="button"
        :disabled="selectedShare === null"
        @click="handleNewTransaction"
      >
        New Transaction
      </button>
    </div>

    <template v-if="selectedShare !== null">
      <suspense>
        <transaction-list class="transaction-list" :store="transactionStore" />
      </suspense>
    </template>
  </div>

  <suspense>
    <new-transaction-modal
      :show="modalState"
      :share="selectedShare"
      :store="transactionStore"
      @cancel="handleNewTransaction"
      @submit="handleNewTransaction"
    />
  </suspense>
</template>

<style scoped>
.transaction-list {
  /* Make pagination buttons always appear at the bottom. */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1em;
}
</style>
