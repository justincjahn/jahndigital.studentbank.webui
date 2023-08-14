<script setup lang="ts">
import type { IMoney } from '@/common/utils/Money';
import { ref, computed, watchEffect, onMounted } from 'vue';

// Services
import { studentsByGroups } from '@/admin/common/services/group';

// Utils
import { GLOBAL_STORE } from '@/admin/symbols';
import injectStrict from '@/common/utils/injectStrict';
import Money from '@/common/utils/Money';
import median from '@/common/utils/median';

// Components
import LoadingPage from '@/common/components/LoadingPage.vue';

interface TableData {
  date: string;
  groupName: string;
  lastName: string;
  firstName: string;
  averageShares: IMoney;
  medianShares: IMoney;
  totalShares: IMoney;
  averageStocks: IMoney;
  medianStocks: IMoney;
  totalStocks: IMoney;
  averageStockShares: number;
  medianStockShares: number;
  totalStockShares: number;
  grandTotal: IMoney;
}

type StudentsByGroups = Awaited<ReturnType<typeof studentsByGroups>>;

const globalStore = injectStrict(GLOBAL_STORE);

const groupIds = computed(() =>
  globalStore.group.groups.value.map((x) => x.id)
);

const loading = ref(true);

const exportLink = ref<HTMLAnchorElement | null>(null);

const data = ref<StudentsByGroups | null>(null);

function sort(a: TableData, b: TableData) {
  if (a.groupName === b.groupName) {
    return a.grandTotal.compare(b.grandTotal as Money) * -1;
  }

  return a.groupName > b.groupName ? 1 : -1;
}

const tableData = computed(() => {
  const returnData: TableData[] = [];
  if (!data.value || !data.value.students || !data.value.students.nodes) {
    return returnData;
  }

  data.value.students.nodes.forEach((student) => {
    const groupName = student.group.name;
    const { lastName, firstName } = student;

    const shareBalances = student.shares.map((x) => x.balance);
    const totalShares = shareBalances.reduce((x, y) => x + y, 0);

    const averageShares =
      totalShares / (shareBalances.length > 0 ? shareBalances.length : 1);

    const medianShares = median(shareBalances);

    const stockBalances = student.stocks.map(
      (x) => x.sharesOwned + x.stock.currentValue
    );

    const totalStocks = stockBalances.reduce((x, y) => x + y, 0);

    const averageStocks =
      totalStocks / (stockBalances.length > 0 ? stockBalances.length : 1);

    const medianStocks = median(stockBalances);

    const stockShares = student.stocks.map((x) => x.sharesOwned);
    const totalStockShares = stockShares.reduce((x, y) => x + y, 0);

    const averageStockShares =
      totalStockShares / (stockShares.length > 0 ? stockShares.length : 1);

    const medianStockShares = median(stockShares);

    const grandTotal = totalShares + totalStocks;

    returnData.push({
      date: new Date().toLocaleDateString(),
      groupName,
      lastName,
      firstName,
      averageShares: Money.fromNumber(averageShares),
      medianShares: Money.fromNumber(medianShares),
      totalShares: Money.fromNumber(totalShares),
      averageStocks: Money.fromNumber(averageStocks),
      medianStocks: Money.fromNumber(medianStocks),
      totalStocks: Money.fromNumber(totalStocks),
      averageStockShares,
      medianStockShares,
      totalStockShares,
      grandTotal: Money.fromNumber(grandTotal),
    });
  });

  returnData.sort(sort);
  return returnData;
});

watchEffect(() => {
  if (!exportLink.value) return;

  const csvData = [
    [
      'Date',
      'Group Name',
      'Last Name',
      'First Name',
      'Average Share Balance',
      'Median Share Balance',
      'Total Share Balance',
      'Average Stock Holdings',
      'Median Stock Holdings',
      'Total Stock Holdings',
      'Average Stock Shares',
      'Median Stock Shares',
      'Total Stock Shares',
      'Total Assets',
    ].join(','),
  ];

  csvData.push(
    ...tableData.value.map((x) =>
      [
        x.date,
        `"${x.groupName.replace('"', '\\"')}"`,
        `"${x.lastName.replace('"', '\\"')}"`,
        `"${x.firstName.replace('"', '\\"')}"`,
        `"${x.averageShares}"`,
        `"${x.medianShares}"`,
        `"${x.totalShares}"`,
        `"${x.averageStocks}"`,
        `"${x.medianStocks}"`,
        `"${x.totalStocks}"`,
        `"${x.averageStockShares}"`,
        `"${x.medianStockShares}"`,
        `"${x.totalStockShares}"`,
        `"${x.grandTotal}"`,
      ].join(',')
    )
  );

  const file = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const dateString = new Date().toISOString().substring(0, 10);
  exportLink.value.href = URL.createObjectURL(file);
  exportLink.value.download = `${dateString}_student_statistics.csv`;
});

onMounted(async () => {
  loading.value = true;

  try {
    data.value = await studentsByGroups({
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
  <section>
    <header>
      <h1>Student Statistics</h1>

      <p>
        <a ref="exportLink" href="#" download="student_statistics.csv">
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
            <th>Group Name</th>
            <th>Last Name</th>
            <th>First Name</th>
            <th>Avg. Share Balance</th>
            <th>Med. Share Balance</th>
            <th>Total Share Balance</th>
            <th>Avg. Stock Holdings</th>
            <th>Med. Stock Holdings</th>
            <th>Total Stock Holdings</th>
            <th>Avg. Stock Shares</th>
            <th>Med. Stock Shares</th>
            <th>Total Stock Shares</th>
            <th>Total Assets</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(stats, index) of tableData" :key="index">
            <td>{{ stats.date }}</td>
            <td>{{ stats.groupName }}</td>
            <td>{{ stats.lastName }}</td>
            <td>{{ stats.firstName }}</td>
            <td>{{ stats.averageShares }}</td>
            <td>{{ stats.medianShares }}</td>
            <td>{{ stats.totalShares }}</td>
            <td>{{ stats.averageStocks }}</td>
            <td>{{ stats.medianStocks }}</td>
            <td>{{ stats.totalStocks }}</td>
            <td>{{ stats.averageStockShares }}</td>
            <td>{{ stats.medianStockShares }}</td>
            <td>{{ stats.totalStockShares }}</td>
            <td>{{ stats.grandTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
section {
  margin-inline: 0.5rem;
}

section header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
</style>
