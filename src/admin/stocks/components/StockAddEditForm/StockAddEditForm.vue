<script setup lang="ts">
import { watchEffect } from 'vue';

// Components
import { VInput, VCurrency, VTextbox } from '@/common/components/inputs';

// Composables
import type { Stock } from '@/common/services/stock';
import type { StockDTO } from './useStockForm';
import useStockForm from './useStockForm';

const props = defineProps<{
  modelValue: StockDTO;
  loading?: boolean;
  selected?: Stock | null;
  valid?: boolean;
  dirty?: boolean;
  shouldReset?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: StockDTO): void;
  (event: 'update:valid', value: boolean): void;
  (event: 'update:dirty', value: boolean): void;
  (event: 'update:loading', value: boolean): void;
  (event: 'update:shouldReset', value: boolean): void;
}>();

const {
  data,
  errors,
  isValid,
  isDirty,
  reset,
  loading: formLoading,
} = useStockForm(props.modelValue);

watchEffect(() => {
  if (props.shouldReset === true) {
    reset();
    emit('update:shouldReset', false);
  }
});

watchEffect(() => {
  emit('update:loading', formLoading.value);
});

watchEffect(() => {
  emit('update:valid', isValid.value);
});

watchEffect(() => {
  emit('update:dirty', isDirty.value);
});

watchEffect(() => {
  if (props.selected) {
    reset(props.selected);
  } else {
    reset();
  }
});
</script>

<template>
  <v-input
    v-model="data.name"
    v-model:error="errors.name"
    name="stock-name"
    label="Name"
    required
  />

  <v-input
    v-model="data.symbol"
    v-model:error="errors.symbol"
    name="stock-symbol"
    label="Symbol"
    required
  />

  <v-currency
    v-model="data.currentValue"
    v-model:error="errors.currentValue"
    name="stock-value"
    label="Value"
    required
    :allow-negative="false"
    :allow-zero="false"
  />

  <v-textbox
    v-model="data.rawDescription"
    name="stock-description"
    label="Description"
  />
</template>
