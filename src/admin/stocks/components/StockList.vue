<script setup lang="ts">
import type { Stock } from '@/common/services/stock';

// Core
import { computed } from 'vue';

// Utils
import Money from '@/common/utils/Money';

// Components
import { VCheckbox } from '@/common/components/inputs';

const props = withDefaults(
  defineProps<{
    modelValue?: Stock | Stock[] | null;
    stocks: Stock[];
  }>(),
  {
    modelValue: undefined,
  }
);

const selectable = computed(() => typeof props.modelValue !== 'undefined');

const multiSelect = computed(() => Array.isArray(props.modelValue));

const allSelected = computed(() =>
  Array.isArray(props.modelValue)
    ? props.modelValue.length === props.stocks.length
    : false
);

const emit = defineEmits<{
  (event: 'update:model-value', value: Stock | Stock[]): void;
}>();

function handleSelect(value: Stock) {
  if (Array.isArray(props.modelValue)) {
    const newStocks = [...props.modelValue];
    const selected = newStocks.findIndex((x) => x.id === value.id);

    if (selected > -1) {
      newStocks.splice(selected, 1);
    } else {
      newStocks.push(value);
    }

    emit('update:model-value', newStocks);
    return;
  }

  emit('update:model-value', value);
}

function handleSelectAll() {
  if (allSelected.value) {
    emit('update:model-value', []);
  } else {
    emit('update:model-value', [...props.stocks]);
  }
}

function isSelected(value: Stock) {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.findIndex((x) => x.id === value.id) > -1;
  }

  if (props.modelValue === null || typeof props.modelValue === 'undefined') {
    return false;
  }

  return props.modelValue.id === value.id;
}
</script>

<template>
  <table :class="{ selectable }">
    <thead>
      <tr>
        <th v-if="multiSelect">
          <v-checkbox
            :model-value="allSelected"
            @update:model-value="handleSelectAll"
          />
        </th>
        <th>Symbol</th>
        <th>Name</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="stocks.length === 0">
        <td colspan="3" class="help-text">No stocks are available...</td>
      </tr>
      <tr
        v-for="stock in stocks"
        :key="stock.id"
        :class="{ selected: isSelected(stock) }"
        @click="handleSelect(stock)"
      >
        <td v-if="multiSelect">
          <v-checkbox :model-value="isSelected(stock)" />
        </td>
        <td>{{ stock.symbol }}</td>
        <td>{{ stock.name }}</td>
        <td>{{ Money.fromNumber(stock.currentValue) }}</td>
      </tr>
    </tbody>
  </table>
</template>
