<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue';

// Services
import { groupStatistics } from '@/admin/common/services/group';

// Utils
import { GLOBAL_STORE } from '@/admin/symbols';
import injectStrict from '@/common/utils/injectStrict';
import Money, { IMoney } from '@/common/utils/Money';

// Components
import LoadingPage from '@/common/pages/LoadingPage.vue';

interface TableData {
  date: string;
  name: string;
  averageShares: IMoney;
  totalShares: IMoney;
  averageStockShares: number;
  totalStockShares: number;
  averageStocks: IMoney;
  totalStocks: IMoney;
  grandTotal: IMoney;
}

const globalStore = injectStrict(GLOBAL_STORE);

const groupIds = computed(() =>
  globalStore.group.groups.value.map((x) => x.id)
);

const loading = ref(true);

const exportLink = ref<HTMLAnchorElement | null>(null);

const data = ref<Awaited<ReturnType<typeof groupStatistics>> | null>(null);

const tableData = computed(() => {
  const returnData: TableData[] = [];
  if (!data.value || !data.value.groupStatistics) return returnData;

  globalStore.group.groups.value.forEach((group) => {
    const stats = (data.value!.groupStatistics ?? []).find(
      (x) => x.groupId === group.id
    );

    if (stats) {
      returnData.push({
        date: new Date().toLocaleDateString(),
        name: group.name,
        averageShares: Money.fromNumber(stats.averageShares),
        totalShares: Money.fromNumber(stats.totalShares),
        averageStockShares: stats.averageSharesOwned,
        totalStockShares: stats.totalSharesOwned,
        averageStocks: Money.fromNumber(stats.averageStocks),
        totalStocks: Money.fromNumber(stats.totalStocks),
        grandTotal: Money.fromNumber(stats.totalShares + stats.totalStocks),
      });
    }
  });

  returnData.sort((a, b) => a.grandTotal.compare(b.grandTotal as Money) * -1);
  return returnData;
});

watchEffect(() => {
  if (!exportLink.value) return;

  const csvData = [
    [
      'Date',
      'Group Name',
      'Average Share Balance',
      'Total Share Balance',
      'Average Stock Shares',
      'Total Stock Shares',
      'Average Stock Holdings',
      'Total Stock Holdings',
      'Total Assets',
    ].join(','),
  ];

  tableData.value.forEach((x) => {
    csvData.push(
      [
        x.date,
        `"${x.name.replace('"', '\\"')}"`,
        `"${x.averageShares}"`,
        `"${x.totalShares}"`,
        `"${x.averageStockShares}"`,
        `"${x.totalStockShares}"`,
        `"${x.averageStocks}"`,
        `"${x.totalStocks}"`,
        `"${x.grandTotal}"`,
      ].join(',')
    );
  });

  const file = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const dateString = new Date().toISOString().substring(0, 10);
  exportLink.value.href = URL.createObjectURL(file);
  exportLink.value.download = `${dateString}_group_statistics.csv`;
});

onMounted(async () => {
  loading.value = true;

  try {
    data.value = await groupStatistics({
      groupId: groupIds.value,
    });
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="container">
    <header
      class="flex-group"
      data-flex-type="start"
      data-flex-align="baseline"
    >
      <h1>Group Statistics</h1>

      <p>
        <a ref="exportLink" href="#" download="group_statistics.csv">
          Export CSV
        </a>
      </p>
    </header>

    <div class="scroll-wrapper">
      <loading-page v-if="loading" />

      <table v-else>
        <thead>
          <tr>
            <th>Date</th>
            <th>Group</th>
            <th>Avg. Share Balance</th>
            <th>Total Share Balance</th>
            <th>Avg. Stock Shares</th>
            <th>Total Stock Shares</th>
            <th>Avg. Stock Holdings</th>
            <th>Total Stock Holdings</th>
            <th>Total Assets</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stats in tableData" :key="stats.name">
            <td>{{ stats.date }}</td>
            <td>{{ stats.name }}</td>
            <td>{{ stats.averageShares }}</td>
            <td>{{ stats.totalShares }}</td>
            <td>{{ stats.averageStockShares }}</td>
            <td>{{ stats.totalStockShares }}</td>
            <td>{{ stats.averageStocks }}</td>
            <td>{{ stats.totalStocks }}</td>
            <td>{{ stats.grandTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
