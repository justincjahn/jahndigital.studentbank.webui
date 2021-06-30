<template>
  <div class="student-transactions">
    <div class="student-transactions__sidebar">
      <share-selector
        v-model="selectedShare"
        :shares="studentShares"
      />

      <transaction-poster
        :share="selectedShare"
        :loading="isPosting"
        @submit="postTransaction"
      />
    </div>

    <div class="student-transactions__main">
      <transaction-list :store="globalStore" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

// Components
import ShareSelector from '@/components/ShareSelector.vue';
import TransactionList from '@/modules/admin/students/components/TransactionList.vue';
import TransactionPoster from '@/components/TransactionPoster.vue';

// Utils
import Money from '@/utils/money';
import injectStrict from '@/utils/injectStrict';

// Stores
import errorStore from '@/stores/error';

// Symbols
import { GLOBAL_STORE } from '../../symbols';

export default defineComponent({
  components: {
    ShareSelector,
    TransactionList,
    TransactionPoster,
  },
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);
    const isPosting = ref<boolean>(false);

    const selectedShare = computed<Share|null>({
      get: () => globalStore.share.selected.value,
      set: (item) => globalStore.share.setSelected(item),
    });

    const studentShares = computed(() => {
      if (!globalStore.student.selected.value) return [] as Share[];
      return globalStore.student.selected.value.shares ?? [] as Share[];
    });

    /**
     * Attempt to post the transaction from the TransactionPoster component and
     * update the selected student's data from the GQL server.
     *
     * @TODO: Find a way to tell all of the components the share's new balance without
     * a full query.
     */
    async function postTransaction(amount: Money, comment?: string) {
      isPosting.value = true;

      const shareId = globalStore.share.selected.value?.id ?? -1;
      try {
        await globalStore.share.postTransaction({
          shareId,
          amount: amount.round(),
          comment,
          takeNegative: true,
        });

        await globalStore.student.refreshSelected();
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        isPosting.value = false;
      }
    }

    return {
      globalStore,
      selectedShare,
      studentShares,
      postTransaction,
      isPosting,
    };
  },
});
</script>

<style lang="scss">
.student-transactions {
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0px auto;

  &__main, &__sidebar {
    width: 100%;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media screen and (min-width: 900px) {
    width: 100%;
    flex-direction: row;

    &__sidebar {
      max-width: 30%;
    }
  }
}
</style>
