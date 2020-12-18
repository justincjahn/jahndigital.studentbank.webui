<template>
<div class="student-transactions">
  <div class="student-transactions__sidebar">
    <share-selector
      :shares="StudentStore.selectedStudent?.shares"
      :selected="ShareStore.selectedShare"
      @select="selectShare"
    />

    <transaction-poster
      :share="ShareStore.selectedShare"
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
import StudentStore from '@/store/modules/student';
import ShareStore from '@/store/modules/share';
import GlobalStore from '@/store/modules/global';
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
      if (ShareStore.selectedShare === share) return;
      ShareStore.setSelectedShare(share);
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

      const shareId = ShareStore.selectedShare?.id ?? -1;
      try {
        await ShareStore.postTransaction({
          shareId,
          amount: amount.round(),
          comment,
          takeNegative: true,
        });

        await StudentStore.refreshSelectedStudent();
      } catch (e) {
        GlobalStore.setCurrentError(e?.message ?? e);
      } finally {
        isPosting.value = false;
      }
    }

    return {
      StudentStore,
      ShareStore,
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
