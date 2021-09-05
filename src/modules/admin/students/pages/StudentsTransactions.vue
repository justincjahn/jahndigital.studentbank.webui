<template>
  <div class="student-transactions">
    <div class="student-transactions__sidebar">
      <share-selector
        v-model="selected"
        :shares="shares"
      />

      <transaction-poster
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

// Utils
import Money from '@/utils/money';
import injectStrict from '@/utils/injectStrict';

// Components
import ShareSelector from '@/components/ShareSelector.vue';
import TransactionList from '../components/TransactionList.vue';
import TransactionPoster from '../components/TransactionPoster.vue';

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

    const shares = computed(() => {
      if (!globalStore.student.selected.value) return [] as Share[];
      return globalStore.student.selected.value.shares ?? [] as Share[];
    });

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
        globalStore.error.setCurrentError(e?.message ?? e);
      } finally {
        isPosting.value = false;
      }
    }

    return {
      globalStore,
      isPosting,
      shares,
      selected: globalStore.share.selected,
      postTransaction,
    };
  },
});
</script>

<style lang="scss">
.student-transactions {
  display: flex;
  flex-direction: column;
  gap: 1em;

  &__sidebar {
    display: flex;
    flex-direction: column;
    flex-basis: 30%;
    gap: 1em;
  }

  &__main {
    flex-basis: 70%;
  }

  .transaction-poster {
    @include round-border;
    background-color: colorStep(secondary, $step: 0, $darken: false);
    padding: 1em;
  }

  @media screen and (min-width: 900px) {
    flex-direction: row;

    &__sidebar {
      max-width: 30%;
    }
  }
}
</style>
