<template>
  <table class="transaction-list" v-if="shareStore.selected.value !== null" :class="{ loading: shareStore.loading.value }">
    <thead>
      <tr>
        <th>Date</th>
        <th class="center">Type</th>
        <th>Comment</th>
        <th class="right">Amount</th>
        <th class="right">New Balance</th>
      </tr>
    </thead>
    <tbody v-if="shareStore.transactions.value.length > 0">
      <tr v-for="transaction in shareStore.transactions.value" :key="transaction.id">
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
  <div class="transaction-list__pagination" v-if="shareStore.pageInfo.value != null">
    <button :disabled="!shareStore.pageInfo.value.hasPreviousPage" @click.passive="shareStore.fetchPreviousTransactions">Previous</button>
    <button :disabled="!shareStore.pageInfo.value.hasNextPage" @click.passive="shareStore.fetchNextTransactions">Next</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import studentStore from '@/store/student';
import shareStore from '@/store/share';

export default defineComponent({
  setup() {
    const prevStudent = ref<Student|null>(null);

    // When the share selection changes, load transactions
    watchEffect(() => {
      if (shareStore.selected.value !== null) {
        shareStore.fetchShareTransactions({
          shareId: shareStore.selected.value.id,
        });
      } else {
        shareStore.clearTransactions();
      }
    });

    // When the student changes, clear the selection
    watchEffect(() => {
      if (studentStore.selected.value !== null) {
        if (studentStore.selected.value.id !== prevStudent.value?.id ?? true) {
          prevStudent.value = studentStore.selected.value;
          shareStore.setSelected(null);
        }
      }
    });

    return {
      shareStore,
    };
  },
});
</script>

<style lang="scss">
  .transaction-list {
    @include table($selectable: false);
  }
</style>
