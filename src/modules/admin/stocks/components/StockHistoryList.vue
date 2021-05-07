<template>
  <div class="stock-history">
    <table>
      <thead>
        <tr>
          <th>Date Changed</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="history.length > 0">
          <tr v-for="item in history" :key="item.id">
            <td>
              {{ new Date(item.dateChanged).toLocaleDateString('en-US') }}
              {{ new Date(item.dateChanged).toLocaleTimeString('en-US') }}
            </td>
            <td>
              {{
                new Intl.NumberFormat(
                  'en-US',
                  {
                    style: 'currency',
                    currency: 'USD',
                  }
                ).format(item.value)
              }}
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="2" class="center">
              <em>Please select a stock.</em>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <div
      v-if="totalPages > 0"
      class="stock-history__pagination"
    >
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
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, watchEffect } from 'vue';
import { setup as defineStockHistoryStore } from '@/store/stockHistory';

export default defineComponent({
  props: {
    selected: {
      type: Object as PropType<Stock|null>,
      default: null,
    },
  },
  setup(props) {
    const stockHistoryStore = defineStockHistoryStore();

    watchEffect(() => {
      if (props.selected !== null) {
        stockHistoryStore.fetch({
          stockId: props.selected.id,
        });
      }
    });

    return {
      ...stockHistoryStore,
    };
  },
});
</script>

<style lang="scss">
  .stock-history {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-content: space-between;

    table {
      @include table($selectable: false);
    }

    &__pagination {
      @include pagination-buttons;
    }
  }
</style>
