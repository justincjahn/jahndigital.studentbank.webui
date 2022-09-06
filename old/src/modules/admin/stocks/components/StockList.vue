<template>
  <div v-if="stocks.length > 0" class="stock-list" :class="loading ? 'loading' : ''">
    <table
      class="selectable"
      :class="!available ? 'selectable' : ''"
    >
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="stock in stocks"
          :key="stock.id"
          :class="isSelected(stock) ? 'selected' : ''"
          @click="handleStockClick(stock)"
        >
          <td>{{ stock.symbol }}</td>
          <td>{{ stock.name }}</td>
          <td>
            {{
              new Intl.NumberFormat(
                'en-US',
                {
                  style: 'currency',
                  currency: 'USD',
                }
              ).format(stock.currentValue)
            }}
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="totalPages > 1"
      class="pagination-buttons"
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
  <p v-else class="stock-list" :class="loading ? 'loading' : ''">
    <em>There are no {{ available ? 'available' : 'linked' }} stocks to display.</em>
  </p>
</template>

<script lang="ts">
/* eslint-disable arrow-body-style */
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';

// Stores
import { GlobalStore } from '../../stores/global';

const delay = 300;
let timer: number|null = null;

export default defineComponent({
  props: {
    selected: {
      type: Object as PropType<Stock|null>,
      default: null,
    },
    available: {
      type: Boolean,
      default: false,
      description: 'List only stocks available to link for selected instance.',
    },
    store: {
      type: Object as PropType<GlobalStore>,
      required: true,
    },
  },
  emits: [
    'stock-click',
    'stock-dblclick',
  ],
  setup(props, { emit }) {
    const prevClicked = ref<Stock|null>(null);
    const clickCount = ref(0);
    const store = computed(() => ((props.available) ? props.store.stockAvailable : props.store.stock));
    const instanceId = computed(() => props.store.instance.selected.value?.id ?? -1);

    // If we're listing available stocks, filter the ones already linked
    const stocks = computed(() => {
      if (props.available) {
        return store.value.items.value.filter((stock) => {
          const instances = (stock?.stockInstances ?? []).map((x) => x.instanceId);
          return !instances.includes(instanceId.value);
        });
      }

      return store.value.items.value;
    });

    /**
     * True if the provided stock is currently selected.
     */
    function isSelected(stock: Stock) {
      return stock.id === props.selected?.id ?? false;
    }

    /**
     * When the user double-clicks on a specific stock, emit an event to the parent.
     */
    function handleStockClick(stock: Stock) {
      clickCount.value += 1;

      if (clickCount.value === 1) {
        timer = setTimeout(() => { clickCount.value = 0; }, delay);
        prevClicked.value = stock;
        emit('stock-click', stock);
      } else {
        if (timer == null) return;
        if (prevClicked.value === stock) {
          clearTimeout(timer);
          clickCount.value = 0;
          emit('stock-dblclick', stock);
        }
      }
    }

    watchEffect(() => {
      if (instanceId.value !== -1 && !props.available) {
        props.store.stock.fetch({ instances: [instanceId.value] });
      } else if (props.available) {
        props.store.stockAvailable.fetch();
      }
    });

    return {
      ...store.value,
      stocks,
      isSelected,
      handleStockClick,
    };
  },
});
</script>

<style lang="scss">
.stock-list {
  &.loading {
    opacity: 0.5;
  }

  table {
    @include round-border;
  }
}
</style>
