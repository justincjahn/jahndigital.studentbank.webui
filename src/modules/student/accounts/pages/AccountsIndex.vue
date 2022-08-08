<template>
  <suspense>
    <share-list
      :selected="selectedShare"
      :shares="orderedShares"
      @start-transfer="startTransfer"
      @click="handleShareClick"
    />
  </suspense>

  <router-view />

  <suspense>
    <transfer-modal
      :show="showTransferModal"
      :source="sourceShare"
      :shares="transferShares"
      :loading="transferLoading"
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
    const transferLoading = ref(false);

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

    /**
     * If the share is already selected, unselect it
     */
    function handleShareClick(share: Share) {
      if ((globalStore.selectedShare.value?.id ?? -1) === share.id) {
        router.push({
          name: AccountsRouteNames.index,
        });
      }
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

      transferLoading.value = true;
      try {
        await newTransfer({
          sourceShareId: sourceShare.value.id,
          destinationShareId: destination.id,
          amount,
          comment: (comment.length > 0) ? comment : undefined,
        });

        await globalStore.fetchShares(sourceShare.value.studentId, false);

        if (currentShareId.value > 0) {
          await globalStore.fetchShareTransactions({
            shareId: currentShareId.value,
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          errorStore.setCurrentError(e?.message ?? e);
        }
      } finally {
        transferLoading.value = false;
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
      } else {
        globalStore.selectedShare.value = null;
      }
    }, { immediate: true });

    return {
      selectedShare: globalStore.selectedShare,
      sourceShare,
      showTransferModal,
      orderedShares,
      transferShares,
      transferLoading,
      startTransfer,
      cancelTransfer,
      handleTransfer,
      handleShareClick,
    };
  },
});
</script>

<style lang="scss" scoped>
h2 {
  margin: 0.75em 0 0.75em 1rem;
}
</style>
