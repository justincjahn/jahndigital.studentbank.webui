<template>
  <table
    v-if="shareStore.selected.value !== null"
    class="transaction-list"
    :class="{ loading: shareStore.loading.value }"
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
    <tbody v-if="shareStore.transactions.value.length > 0">
      <tr v-for="transaction in shareStore.transactions.value" :key="transaction.id">
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
  <div v-if="shareStore.pageInfo.value != null" class="pagination-buttons">
    <button
      :disabled="!shareStore.pageInfo.value.hasPreviousPage"
      @click.passive="shareStore.fetchPreviousTransactions"
    >
      Previous
    </button>
    <button
      :disabled="!shareStore.pageInfo.value.hasNextPage"
      @click.passive="shareStore.fetchNextTransactions"
    >
      Next
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, PropType } from 'vue';
import { ShareStore } from '@/modules/admin/stores/share';

export default defineComponent({
  props: {
    shareStore: {
      type: Object as PropType<ShareStore>,
      required: true,
    },
  },
  setup(props) {
    // When the selected share changes, fetch new transactions
    watch(() => props.shareStore.selected.value, (newValue) => {
      if (newValue !== null) {
        props.shareStore.fetchShareTransactions({ shareId: newValue.id });
      } else {
        props.shareStore.clearTransactions();
      }
    }, { immediate: true });
  },
});
</script>
