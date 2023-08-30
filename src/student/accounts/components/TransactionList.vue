<script setup lang="ts">
import type { TransactionStore } from '@/common/stores/transaction';
import Money from '@/common/utils/Money';

defineProps<{
  store: TransactionStore;
}>();
</script>

<template>
  <div
    class="transaction-list | scroll-wrapper"
    :class="{ loading: store.loading.value }"
  >
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Comment</th>
          <th>Amount</th>
          <th>New Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in store.transactions.value" :key="t.id">
          <td>{{ new Date(t.effectiveDate).toLocaleDateString() }}</td>
          <td>{{ t.comment }}</td>
          <td>{{ Money.fromNumber(t.amount) }}</td>
          <td>{{ Money.fromNumber(t.newBalance) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="store.totalPages.value > 1" class="pagination-buttons">
    <button
      type="button"
      :disabled="!store.hasPreviousPage.value"
      @click.passive="store.fetchPrevious"
    >
      Previous
    </button>

    <button
      type="button"
      :disabled="!store.hasNextPage.value"
      @click.passive="store.fetchNext"
    >
      Next
    </button>
  </div>
</template>

<style scoped>
table td:nth-child(1) {
  min-width: 10ch;
}

table td:nth-child(2) {
  width: 100%;
  min-width: 15rem;
}

table td:nth-child(3),
table td:nth-child(4) {
  min-width: 12ch;
}
</style>
