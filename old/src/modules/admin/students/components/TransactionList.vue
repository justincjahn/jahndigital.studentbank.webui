<template>
  <table
    v-if="selectedShare !== null"
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
    <tbody v-if="transactions.length > 0">
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
    <tbody v-else>
      <tr>
        <td class="center" colspan="5">
          <i>No transactions yet!</i>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="pageCount > 1" class="pagination-buttons">
    <button
      :disabled="!hasPreviousPage"
      @click.passive="fetchPrevious"
    >
      Previous
    </button>
    <button
      :disabled="!hasNextPage"
      @click.passive="fetchNext"
    >
      Next
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, PropType } from 'vue';
import { GlobalStore } from '../../stores/global';

export default defineComponent({
  props: {
    store: {
      type: Object as PropType<GlobalStore>,
      required: true,
    },
  },
  setup(props) {
    // When the selected share changes, fetch new transactions
    watch(() => props.store.share.selected.value, (newValue) => {
      if (newValue !== null) {
        props.store.share.fetchShareTransactions({ shareId: newValue.id, cache: false });
      } else {
        props.store.share.clearTransactions();
      }
    }, { immediate: true });

    return {
      loading: props.store.share.loading,
      selectedShare: props.store.share.selected,
      transactions: props.store.share.transactions,
      pageCount: props.store.share.totalTransactionPages,
      hasNextPage: props.store.share.hasNextPage,
      hasPreviousPage: props.store.share.hasPreviousPage,
      fetchNext: props.store.share.fetchNextTransactions,
      fetchPrevious: props.store.share.fetchPreviousTransactions,
    };
  },
});
</script>
