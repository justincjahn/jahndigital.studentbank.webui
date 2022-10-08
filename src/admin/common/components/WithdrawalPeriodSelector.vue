<script lang="ts">
import { computed } from 'vue';

// Types
import type { PeriodStrings } from '@/common/types/PeriodStrings';

// Enums
import Period from '@/common/enums/Period';

// Components
import { VSelect, VOption } from '@/common/components/inputs';

export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
const options = Object.keys(Period);

const props = defineProps<{
  // The currently selected item
  modelValue: string;

  // A unique name for this component
  name?: string;

  // A unique ID for this component
  id?: string;

  // The prompt to use when there's currently no item selected
  prompt?: string;

  // The label displayed above the select box
  label?: string;

  // Helper text displayed above the select box
  helpText?: string;

  // The width of the select element
  width?: string;

  // If the entire select element is disabled
  disabled?: boolean;

  // If the value is required
  required?: boolean;
}>();

const labelValue = computed(() => {
  if (!props.modelValue) return undefined;
  return Period[props.modelValue as PeriodStrings] ?? 'UNKNOWN';
});

defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <v-select
    v-bind="props"
    @update:model-value="(x) => $emit('update:modelValue', x)"
  >
    <template #activatorLabel="{ prompt: promptText }">
      {{ labelValue ?? promptText }}
    </template>

    <v-option v-for="option in options" :key="option" :value="option">
      {{ Period[option as PeriodStrings] }}
    </v-option>
  </v-select>
</template>
