<template>
  <div class="student-transactions">
    <div class="student-transactions__sidebar">
      <share-selector
        v-model="selectedShare"
        :shares="studentStore.selected.value?.shares"
      />

      <transaction-poster
        :share="shareStore.selected"
        :loading="isPosting"
        @submit="postTransaction"
      />
    </div>

    <div class="student-transactions__main">
      <transaction-list
        :share-store="shareStore"
      />
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
import { setup as defineShareStore } from '@/modules/admin/stores/share';
import errorStore from '@/stores/error';

import { STUDENT_STORE_SYMBOL } from '../symbols';

export default defineComponent({
  components: {
    ShareSelector,
    TransactionList,
    TransactionPoster,
  },
  setup() {
    const studentStore = injectStrict(STUDENT_STORE_SYMBOL);
    const shareStore = defineShareStore(studentStore);
    const isPosting = ref<boolean>(false);

    // Proxy get/set requests to the shareStore
    const selectedShare = computed<Share|null>({
      get: () => shareStore.selected.value,
      set: (item) => shareStore.setSelected(item),
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

      const shareId = shareStore.selected.value?.id ?? -1;
      try {
        await shareStore.postTransaction({
          shareId,
          amount: amount.round(),
          comment,
          takeNegative: true,
        });

        await shareStore.studentStore.refreshSelected();
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        isPosting.value = false;
      }
    }

    return {
      studentStore: shareStore.studentStore,
      shareStore,
      selectedShare,
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
