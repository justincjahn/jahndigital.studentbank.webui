<template>
  <table class="transaction-list" v-if="share !== null">
    <thead>
      <tr>
        <th>Date</th>
        <th class="center">Type</th>
        <th>Comment</th>
        <th class="right">Amount</th>
        <th class="right">New Balance</th>
      </tr>
    </thead>
    <tbody v-if="transactions.length > 0">
      <tr v-for="transaction in transactions" :key="transaction.id">
        <td>{{new Date(transaction.effectiveDate).toLocaleDateString("en-US")}}</td>
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
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import Apollo from '@/services/Apollo';
import gqlTransactions from '@/graphql/transactions.query.gql';

export default defineComponent({
  props: {
    share: {
      type: Object as () => Share|null,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const transactions = ref<Transaction[]>([]);

    watch(() => props.share, async (share) => {
      if (share === null) return;

      const res = await Apollo.query<PagedTransactionResponse>({
        query: gqlTransactions,
        variables: {
          shareId: share.id,
        },
      });

      if (res.data) {
        transactions.value = res.data.transactions.nodes;
      }
    });

    return {
      transactions,
    };
  },
});
</script>

<style lang="scss">
  .transaction-list {
    @include table($selectable: false);
  }
</style>
