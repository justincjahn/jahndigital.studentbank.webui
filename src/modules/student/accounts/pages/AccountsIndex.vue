<template>
  <suspense>
    <share-list
      :selected="selectedShare"
      :shares="orderedShares"
      @start-transfer="startTransfer"
    />
  </suspense>

  <router-view />

  <suspense>
    <transfer-modal
      :show="showTransferModal"
      :source="sourceShare"
      :shares="transferShares"
      @ok="handleTransfer"
      @cancel="cancelTransfer"
    />
  </suspense>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

// Services
import { newTransfer } from '@/services/transaction';

// Store
import errorStore from '@/stores/error';
import injectStrict from '@/utils/injectStrict';
import { GLOBAL_STORE } from '../../symbols';

// Route Names
import AccountsRouteNames from '../routeNames';

export default defineComponent({
  components: {
    ShareList: defineAsyncComponent(() => import('../components/ShareList.vue')),
    TransferModal: defineAsyncComponent(() => import('../components/TransferModal.vue')),
  },
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);
    const router = useRouter();
    const sourceShare = ref<Share|null>(null);
    const showTransferModal = ref(false);

    const orderedShares = computed(() => {
      const shares = [...globalStore.shares.value];
      shares.sort(((a, b) => (((a.shareType?.name ?? '') > (b.shareType?.name ?? '')) ? 1 : -1)));
      return shares;
    });

    const transferShares = computed(() => orderedShares.value.filter((x) => x.id !== sourceShare.value?.id ?? -1));

    const currentShareId = computed(() => +(router.currentRoute.value.params.shareId ?? -1));

    /**
     * Set provided share as the source and open the transfer modal.
     */
    function startTransfer(share: Share) {
      sourceShare.value = share;
      showTransferModal.value = true;
    }

    /**
     * Close the modal without conducting the transfer.
     */
    function cancelTransfer() {
      showTransferModal.value = false;
    }

    type transferPayload = {
      destination: Share;
      amount: number;
      comment: string;
    }

    /**
     * Perform the transfer then close the modal.
     */
    async function handleTransfer({ destination, amount, comment }: transferPayload) {
      if (!sourceShare.value) return;

      try {
        await newTransfer({
          sourceShareId: sourceShare.value.id,
          destinationShareId: destination.id,
          amount,
          comment: (comment.length > 0) ? comment : undefined,
        });

        await globalStore.fetchShares(sourceShare.value.studentId, false);

        await globalStore.fetchShareTransactions({
          shareId: currentShareId.value,
        });
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        showTransferModal.value = false;
      }
    }

    watch(() => router.currentRoute.value, (newRoute) => {
      if (newRoute.name !== AccountsRouteNames.index) return;

      let shareIds = newRoute.params?.shareId ?? [];
      if (!Array.isArray(shareIds)) shareIds = [shareIds];

      const shareId: string|undefined = shareIds[0];
      if (typeof shareId === 'undefined') {
        globalStore.selectedShare.value = null;
        globalStore.clearTransactions();
        return;
      }

      const selected = globalStore.shares.value.find((x) => x.id === +shareId);
      if (selected) {
        globalStore.selectedShare.value = selected;
        globalStore.fetchShareTransactions({
          shareId: selected.id,
          first: 10,
        });
      }
    }, { immediate: true });

    return {
      selectedShare: globalStore.selectedShare,
      sourceShare,
      showTransferModal,
      orderedShares,
      transferShares,
      startTransfer,
      cancelTransfer,
      handleTransfer,
    };
  },
});
</script>

<style lang="scss" scoped>
h2 {
  margin: 0.75em 0 0.75em 1rem;
}
</style>
