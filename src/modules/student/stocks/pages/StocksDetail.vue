<template>
  <loading-label v-if="loading" class="page-loading" />

  <div v-else class="stock-details">
    <h2>
      {{ stock?.name }} Detail
    </h2>

    <table
      v-if="stockHistory.length > 0 || historyLoading"
      class="stock-details__history-list"
      :class="{ loading: historyLoading }"
    >
      <thead>
        <tr>
          <th class="left">
            Date
          </th>
          <th class="right">
            Price
          </th>
          <th>
            Change
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(history, index) in stockHistory" :key="history.id">
          <td>
            {{ new Date(history.dateChanged).toLocaleDateString('en-US') }}
          </td>
          <td class="right">
            {{
              new Intl.NumberFormat(
                'en-US',
                {
                  style: 'currency',
                  currency: 'USD',
                }
              ).format(history.value)
            }}
          </td>
          <td v-for="(data, x) in [changeData(index)]" :key="x">
            <span class="stock-details__history-list--difference">{{ data.difference.toFixed(2) }}%</span>

            <div :class="`stock-details__history-list--${data.direction}`">
              <font-awesome-icon
                v-if="data.direction === 'up'"
                :icon="faCaretUp"
                fixed-width
              />

              <font-awesome-icon
                v-else-if="data.direction === 'down'"
                :icon="faCaretDown"
                fixed-width
              />

              <span v-else>
                ~
              </span>
            </div>
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
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Icons
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';

// Utils
import injectStrict from '@/utils/injectStrict';

// Services
import { getStocks } from '@/services/stock';

// Stores
import { GLOBAL_STORE } from '../../symbols';
import errorStore from '@/stores/error';

// Routes
import StocksRouteNames from '../routeNames';

export default defineComponent({
  components: {
    LoadingLabel,
  },
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);
    const router = useRouter();
    const loading = ref(true);
    const historyLoading = ref(true);
    const stock = ref<Stock|null>(null);

    /**
     * Calculates the percent increase between the current value and the previous.
     */
    function changeData(index: number) {
      const current = globalStore.stockHistory.items.value[index];
      const previous = globalStore.stockHistory.items.value[index + 1] || null;

      if (previous === null || current === undefined || previous.value === 0) {
        return {
          direction: 'none',
          increase: 0,
          difference: 0,
        };
      }

      const increase = current.value - previous.value;
      const difference = (increase / previous.value) * 100;

      return {
        // eslint-disable-next-line no-nested-ternary
        direction: (increase > 0) ? 'up' : (increase !== 0) ? 'down' : 'none',
        increase,
        difference,
      };
    }

    onMounted(async () => {
      const route = router.currentRoute.value;
      const id = route.params.id ? +route.params.id : 0;

      if (Number.isNaN(id) || id < 1) {
        throw new Error('Stock ID invalid.');
      }

      try {
        const stockRes = await getStocks({
          where: {
            id: { eq: id },
          },
        });

        if (!stockRes.stocks || !stockRes.stocks.nodes) {
          throw new Error('Stock not found.');
        }

        [stock.value] = stockRes.stocks.nodes;
      } catch (e) {
        await router.push({ name: StocksRouteNames.index });
        return;
      } finally {
        loading.value = false;
      }

      try {
        await globalStore.stockHistory.fetch({
          stockId: stock.value.id ?? -1,
        });
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        historyLoading.value = false;
      }
    });

    return {
      faCaretUp,
      faCaretDown,
      loading,
      historyLoading,
      stock,
      stockHistory: globalStore.stockHistory.items,
      next: globalStore.stockHistory.fetchNext,
      previous: globalStore.stockHistory.fetchPrevious,
      hasNext: globalStore.stockHistory.hasNextPage,
      hasPrevious: globalStore.stockHistory.hasPreviousPage,
      changeData,
    };
  },
});
</script>

<style lang="scss">
.stock-details {
  margin: 0 2em;

  h2 {
    margin-bottom: 1em;
  }

  &__history-list {
    &--up, &--down, &--none {
      display: inline-block;
    }

    &--up {
      color: green;
    }

    &--down {
      color: red;
    }

    &--none {
      font-weight: bold;
      user-select: none;
    }
  }
}
</style>
