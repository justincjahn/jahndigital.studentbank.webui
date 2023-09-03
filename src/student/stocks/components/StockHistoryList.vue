<script setup lang="ts">
import type { StockHistoryStore } from '@/student/stocks/stores/stockHistory';

// Core
import { toRef } from 'vue';

// Utils
import Money from '@/common/utils/Money';

// Icons
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

const props = defineProps<{
  store: StockHistoryStore;
}>();

const history = toRef(() => props.store.history.value);

function changeData(index: number) {
  const current = history.value[index];
  const previous = history.value[index + 1] || null;

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
    direction: increase > 0 ? 'up' : increase !== 0 ? 'down' : 'none',
    increase,
    difference,
  };
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Price</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(h, index) in history" :key="h.id">
        <td>{{ new Date(h.dateChanged).toLocaleDateString() }}</td>
        <td>{{ Money.fromNumber(h.value) }}</td>
        <td v-for="(data, x) in [changeData(index)]" :key="x">
          <span class="difference">{{ data.difference.toFixed(2) }}%</span>
          <span class="icon size-l" :data-direction="data.direction">
            <font-awesome-icon
              v-if="data.direction !== 'none'"
              :icon="data.direction === 'up' ? faCaretUp : faCaretDown"
            />
            <template v-else> ~ </template>
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
td:last-child,
th:last-child {
  text-align: right;
}

td span {
  display: inline-block;
}

.difference {
  margin-right: 0.5rem;
}

.icon {
  width: 0.625em;
  text-align: center;
  user-select: none;
}

.icon[data-direction='up'] {
  color: green;
}

.icon[data-direction='down'] {
  color: red;
}
</style>
