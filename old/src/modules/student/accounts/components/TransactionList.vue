<template>
  <div class="transaction-list" :class="{ loading }">
    <table :class="{ loading }">
      <thead>
        <tr>
          <th>
            Date
          </th>
          <th class="center">
            Type
          </th>
          <th>
            Comment
          </th>
          <th class="right">
            Amount
          </th>
          <th class="right">
            New Balance
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id">
          <td>
            {{ new Date(transaction.effectiveDate).toLocaleDateString('en-US') }}
            {{ new Date(transaction.effectiveDate).toLocaleTimeString('en-US') }}
          </td>
          <td class="center">
            {{ transaction.transactionType }}
          </td>
          <td>
            {{ transaction.comment }}
          </td>
          <td class="right">
            {{
              new Intl.NumberFormat(
                'en-US',
                {
                  style: 'currency',
                  currency: 'USD',
                }
              ).format(transaction.amount)
            }}
          </td>
          <td class="right">
            {{
              new Intl.NumberFormat(
                'en-US',
                {
                  style: 'currency',
                  currency: 'USD',
                }
              ).format(transaction.newBalance)
            }}
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-if="hasNext || hasPrevious"
      class="pagination-buttons"
    >
      <button
        :disabled="!hasPrevious"
        @click.passive="previous"
      >
        Previous
      </button>
      <button
        :disabled="!hasNext"
        @click.passive="next"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Store
import injectStrict from '@/utils/injectStrict';
import { GLOBAL_STORE } from '../../symbols';

export default defineComponent({
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);

    return {
      loading: globalStore.shareTransactionsLoading,
      transactions: globalStore.shareTransactions,
      hasPrevious: globalStore.shareTransactionsHasPreviousPage,
      hasNext: globalStore.shareTransactionsHasNextPage,
      next: globalStore.fetchNextShareTransactions,
      previous: globalStore.fetchPreviousShareTransactions,
    };
  },
});
</script>

<style lang="scss">
.transaction-list table {
  @include mobile-table($names: [
    Date,
    Type,
    Comment,
    Amount,
    New Balance
  ]);
}
</style>
