<script setup lang="ts">
import type { TransactionStore } from '@/common/stores/transaction';

// Core
import { toRef } from 'vue';

// Utils
import Money from '@/common/utils/Money';

const props = defineProps<{
  store: TransactionStore;
}>();

const {
  loading,
  transactions,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  fetchNext,
  fetchPrevious,
} = toRef(props, 'store').value;
</script>

<template>
  <div class="transaction-list" :class="{ loading }">
    <div class="scroll-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Comment</th>
            <th>Amount</th>
            <th>New Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="transactions.length === 0">
            <td colspan="5">No transactions to display yet...</td>
          </tr>
          <template v-else>
            <tr v-for="transaction in transactions" :key="transaction.id">
              <td>
                {{
                  new Date(transaction.effectiveDate).toLocaleDateString(
                    'en-US'
                  )
                }}
              </td>
              <td>
                {{ transaction.transactionType }}
              </td>
              <td>
                {{ transaction.comment ?? '' }}
              </td>
              <td>
                {{ Money.fromNumber(transaction.amount) }}
              </td>
              <td>
                {{ Money.fromNumber(transaction.newBalance) }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination-buttons">
      <button type="button" :disabled="!hasPreviousPage" @click="fetchPrevious">
        Previous
      </button>
      <button type="button" :disabled="!hasNextPage" @click="fetchNext">
        Next
      </button>
    </div>
  </div>
</template>
