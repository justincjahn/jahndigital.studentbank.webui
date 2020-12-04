<template>
<div class="student-transactions">
  <share-list
    :shares="StudentStore.selectedStudent.shares"
    :selected="selectedShare"
    @select="selectShare"
  />

  <transaction-list :share="selectedShare"/>
</div>
</template>

<script lang="ts">
import StudentStore from '@/store/modules/student';
import ShareList from '@/components/ShareList.vue';
import TransactionList from '@/components/TransactionList.vue';
import { defineComponent, ref } from 'vue';
import Share from '@/@types/Share';

export default defineComponent({
  components: {
    ShareList,
    TransactionList,
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
  margin: 0px auto;
}
</style>
