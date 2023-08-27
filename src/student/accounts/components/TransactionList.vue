<script setup lang="ts">
import type { TransactionStore } from '@/common/stores/transaction';
import Money from '@/common/utils/Money';

defineProps<{
  store: TransactionStore;
}>();
</script>

<template>
  <div class="transaction-list" :class="{ loading: store.loading.value }">
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Comment</th>
          <th>New Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in store.transactions.value" :key="t.id">
          <td>{{ new Date(t.effectiveDate).toLocaleDateString() }}</td>
          <td>{{ t.transactionType }}</td>
          <td>{{ t.comment }}</td>
          <td>{{ Money.fromNumber(t.newBalance) }}</td>
        </tr>
      </tbody>
    </table>

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
  </div>
</template>
