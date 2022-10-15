<script lang="ts">
import { computed } from 'vue';

// Enums
import { Period } from '@/admin/common/services/shareType';

// Components
import { VSelect, VOption } from '@/common/components/inputs';

export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
const props = defineProps<{
  // The currently selected item
  modelValue: Period | null;

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
  return (
    Object.keys(Period)[Object.values(Period).indexOf(props.modelValue)] ??
    'Unknown'
  );
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

    <v-option
      v-for="[key, value] in Object.entries(Period)"
      :key="key"
      :value="value"
    >
      {{ key }}
    </v-option>
  </v-select>
</template>
