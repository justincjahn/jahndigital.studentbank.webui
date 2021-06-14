<template>
  <table
    class="transaction-list"
    :class="{ loading }"
  >
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
  <div v-if="hasNext || hasPrevious" class="pagination-buttons">
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
// Collapse the table into rows instead of columns for small screens
@media screen and (max-width: 800px) {
  .transaction-list {
    // padding: 0 1.5em;

    & thead, & tbody, & th, & td, & tr {
      display: block;
    }

    & thead th {
      display: none;
    }

    & tr + tr {
      border-top: 2px solid colorStep(secondary, $step: 4);
    }

    & tbody tr td {
      $size: 8em;

      position: relative;
      padding-left: $size !important;
      border: none;
      text-align: left !important;
      word-break: break-all;

      & + td {
        border-top: 1px solid colorStep(secondary, $step: 2);
      }

      &::before {
        position: absolute;
        top: 0.5em;
        left: 0.25em;
        width: $size;
        white-space: nowrap;
        font-weight: bold;
      }

      &:nth-of-type(1)::before {
        content: 'Date';
      }

      &:nth-of-type(2)::before {
        content: 'Type';
      }

      &:nth-of-type(3)::before {
        content: 'Comment';
      }

      &:nth-of-type(4)::before {
        content: 'Amount';
      }

      &:nth-of-type(5)::before {
        content: 'New Balance';
      }
    }
  }
}
</style>
