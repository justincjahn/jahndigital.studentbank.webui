<template>
  <table class="transaction-list" v-if="ShareStore.selectedShare !== null" :class="{ loading: ShareStore.loading }">
    <thead>
      <tr>
        <th>Date</th>
        <th class="center">Type</th>
        <th>Comment</th>
        <th class="right">Amount</th>
        <th class="right">New Balance</th>
      </tr>
    </thead>
    <tbody v-if="ShareStore.transactions.length > 0">
      <tr v-for="transaction in ShareStore.transactions" :key="transaction.id">
        <td>
          {{new Date(transaction.effectiveDate).toLocaleDateString('en-US')}}
          {{new Date(transaction.effectiveDate).toLocaleTimeString('en-US')}}
        </td>
        <td class="center">{{transaction.transactionType}}</td>
        <td>{{transaction.comment}}</td>
        <td class="right">{{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(transaction.amount)
        }}</td>
        <td class="right">{{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(transaction.newBalance)
        }}</td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td class="center" colspan="5"><i>No transactions yet!</i></td>
      </tr>
    </tbody>
  </table>
  <div class="transaction-list__pagination" v-if="ShareStore.pageInfo != null">
    <button :disabled="!ShareStore.pageInfo.hasPreviousPage" @click.passive="ShareStore.fetchPreviousTransactions()">Previous</button>
    <button :disabled="!ShareStore.pageInfo.hasNextPage" @click.passive="ShareStore.fetchNextTransactions()">Next</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import StudentStore from '@/store/modules/student';
import ShareStore from '@/store/modules/share';

export default defineComponent({
  setup() {
    const prevStudent = ref<Student|null>(null);

    // When the share selection changes, load transactions
    watchEffect(() => {
      if (ShareStore.selectedShare !== null) {
        ShareStore.fetchShareTransactions({
          shareId: ShareStore.selectedShare.id,
        });
      } else {
        ShareStore.clearTransactions();
      }
    });

    // When the student changes, clear the selection
    watchEffect(() => {
      if (StudentStore.selectedStudent !== null) {
        if (StudentStore.selectedStudent.id !== prevStudent.value?.id ?? true) {
          prevStudent.value = StudentStore.selectedStudent;
          ShareStore.setSelectedShare(null);
        }
      }
    });

    return {
      ShareStore,
    };
  },
});
</script>

<style lang="scss">
  .transaction-list {
    @include table($selectable: false);
  }
</style>
