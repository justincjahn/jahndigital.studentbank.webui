<template>
<div class="student-transactions">
  <div class="student-transactions__sidebar">
    <share-list
      :shares="StudentStore.selectedStudent?.shares"
      :selected="selectedShare"
      @select="selectShare"
    />

    <transaction-poster :share="selectedShare" />
  </div>

  <div class="student-transactions__main">
    <transaction-list :share="selectedShare"/>
  </div>
</div>
</template>

<script lang="ts">
import StudentStore from '@/store/modules/student';
import ShareList from '@/components/ShareList.vue';
import TransactionList from '@/components/TransactionList.vue';
import TransactionPoster from '@/components/TransactionPoster.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    ShareList,
    TransactionList,
    TransactionPoster,
  },
  setup() {
    const selectedShare = ref<Share|null>(null);

    /**
     * Set the selected share when the use clicks a button.
     */
    function selectShare(share: Share) {
      if (selectedShare.value === share) return;
      selectedShare.value = share;
    }

    return {
      StudentStore,
      selectShare,
      selectedShare,
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
