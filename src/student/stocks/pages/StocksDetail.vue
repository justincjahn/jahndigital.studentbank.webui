<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';
import type { Stock } from '@/common/services/stock';

// Core
import { defineAsyncComponent, ref, toRef, computed } from 'vue';
import { useRoute } from 'vue-router';

// Stores
import { setup as setupStockHistoryStore } from '@/student/stocks/stores/stockHistory';

// Composables
import useGlobalStore from '@/student/common/composables/useGlobalStore';

// Components
import LoadingPage from '@/common/pages/LoadingPage.vue';
import StockHistoryList from '@/student/stocks/components/StockHistoryList.vue';
import Money from '@/common/utils/Money';

const apexchart = defineAsyncComponent(() => import('vue3-apexcharts'));

const router = useRoute();

const stockId = toRef(() => {
  const id = Array.isArray(router.params.id)
    ? +router.params.id[0]
    : +router.params.id;

  return Number.isNaN(id) ? -1 : id;
});

const globalStore = useGlobalStore();

const stockHistoryStore = setupStockHistoryStore();
const historyLoading = toRef(() => stockHistoryStore.loading.value);

const stockLoading = ref(false);
const stock = ref<Stock | null>(null);

const description = computed(() =>
  stock.value?.formattedDescription
    ? stock.value.formattedDescription
    : 'No description available.'
);

const chartOptions = computed(() => {
  const values = stockHistoryStore.history.value;
  const latest = values[0]?.value ?? -1;
  const previous = values[1]?.value ?? -1;
  const color = latest >= previous ? '#198754' : '#DC3848';

  return {
    colors: [color],
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      labels: {
        formatter(val) {
          return Money.fromNumber(val).toString();
        },
      },
    },
    tooltip: {
      y: {
        formatter(val) {
          return Money.fromNumber(val).toString();
        },
      },
      x: {
        format: 'dd MMM yyyy',
      },
    },
    chart: {
      zoom: {
        autoScaleYaxis: true,
      },
    },
  } as ApexOptions;
});

const chartSeries = computed(() => {
  const data = stockHistoryStore.history.value.map((history) => ({
    x: new Date(history.dateChanged).getTime(),
    y: history.value,
  }));

  return [
    {
      name: 'Value',
      data,
    },
  ] as ApexAxisChartSeries;
});

async function fetchById() {
  if (stockId.value > 0) {
    stockLoading.value = true;

    try {
      stock.value = await globalStore.stock.findById(stockId.value);
    } catch (e) {
      if (e instanceof Error) {
        globalStore.error.setCurrentError(e.message);
      }
    } finally {
      stockLoading.value = false;
    }

    if (stock.value !== null) {
      try {
        await stockHistoryStore.fetch({
          stockId: stock.value.id,
        });
      } catch (e) {
        if (e instanceof Error) {
          globalStore.error.setCurrentError(e.message);
        }
      }
    }
  }
}

fetchById();
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="container section flow" :class="{ loading: stockLoading }">
    <loading-page v-if="stockLoading" />
    <template v-else>
      <h2 class="size-xl">{{ stock?.name ?? 'Loading...' }}</h2>
      <div v-html="description" />

      <suspense>
        <apexchart
          :options="chartOptions"
          :series="chartSeries"
          type="line"
          width="100%"
          height="250rem"
        />

        <template #fallback>
          <loading-page />
        </template>
      </suspense>

      <div :class="{ loading: historyLoading }">
        <stock-history-list :store="stockHistoryStore" />
      </div>
    </template>
  </div>
</template>
