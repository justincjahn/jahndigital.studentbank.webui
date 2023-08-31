<script setup lang="ts">
import type { Share } from '@/common/services/share';
import { defineAsyncComponent, ref, watch, watchEffect } from 'vue';
import useGlobalStore from '@/student/common/composables/useGlobalStore';
import { setup as setupTransactionStore } from '@/common/stores/transaction';

// NOTE: We want to preload this page because it's the default no async components
import ShareList from '@/student/accounts/components/ShareList.vue';
import TransactionList from '@/student/accounts/components/TransactionList.vue';
import LoadingLabel from '@/common/components/LoadingLabel.vue';

const TransferModal = defineAsyncComponent(
  () => import('@/student/common/components/TransferModal.vue')
);

const globalStore = useGlobalStore();
const transactionStore = setupTransactionStore();
transactionStore.pageSize.value = 15;

const transferSource = ref<Share | null>(null);
const transferShow = ref(false);
const transferLoading = ref(false);

function handleTransferBegin(share: Share) {
  transferSource.value = share;
  transferShow.value = true;
}

async function handleTransferSubmit(
  data: Parameters<typeof transactionStore.transfer>[0]
) {
  transferLoading.value = true;

  try {
    await transactionStore.transfer(data);
    transferShow.value = false;
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    }
  } finally {
    transferLoading.value = false;
  }
}

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
    >
      <template #default="{ share }">
        <button
          type="button"
          class="section"
          data-section-type="bottomless"
          @click.stop="handleTransferBegin(share)"
        >
          Transfer
        </button>
      </template>
    </share-list>

    <div v-if="globalStore.share.selected.value" class="section">
      <h2 class="size-xl">Recent Transactions</h2>
      <transaction-list :store="transactionStore" />
    </div>
  </div>

  <suspense>
    <transfer-modal
      :show="transferShow"
      :loading="transferLoading"
      :source="transferSource"
      :store="globalStore"
      @cancel="transferShow = false"
      @submit="handleTransferSubmit"
    />

    <template #fallback>
      <button type="button" disabled>
        <loading-label :show="true">Loading...</loading-label>
      </button>
    </template>
  </suspense>
</template>
