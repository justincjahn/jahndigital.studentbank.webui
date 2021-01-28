<template>
<div class="student-transactions">
  <div class="student-transactions__sidebar">
    <share-selector
      :shares="studentStore.selected.value?.shares"
      :selected="shareStore.selected.value"
      @select="selectShare"
    />

    <transaction-poster
      :share="shareStore.selected"
      @submit="postTransaction"
      :loading="isPosting"
    />
  </div>

  <div class="student-transactions__main">
    <transaction-list />
  </div>
</div>
</template>

<script lang="ts">
import studentStore from '@/store/student';
import shareStore from '@/store/share';
import errorStore from '@/store/error';
import ShareSelector from '@/components/ShareSelector.vue';
import TransactionList from '@/components/admin/students/TheTransactionList.vue';
import TransactionPoster from '@/components/TransactionPoster.vue';
import { defineComponent, ref } from 'vue';
import Money from '@/utils/money';

export default defineComponent({
  components: {
    ShareSelector,
    TransactionList,
    TransactionPoster,
  },
  setup() {
    const isPosting = ref<boolean>(false);

    /**
     * Set the selected share when the use clicks a button.
     */
    function selectShare(share: Share) {
      if (shareStore.selected.value === share) return;
      shareStore.setSelected(share);
    }

    /**
     * Attempt to post the transaction from the TransactionPoster component and
     * update the selected student's data from the GQL server.
     *
     * @TODO: Find a way to tell all of the components the share's new balance without
     * a full query.
     */
    async function postTransaction(amount: Money, comment?: string) {
      isPosting.value = true;

      const shareId = shareStore.selected.value?.id ?? -1;
      try {
        await shareStore.postTransaction({
          shareId,
          amount: amount.round(),
          comment,
          takeNegative: true,
        });

        await studentStore.refreshSelected();
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        isPosting.value = false;
      }
    }

    return {
      studentStore,
      shareStore,
      selectShare,
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
