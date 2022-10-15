<script lang="ts" setup>
import type { ShareType } from '@/admin/common/services/shareType';
import Rate from '@/common/utils/Rate';
import { VCheckbox } from '@/common/components/inputs';

const props = defineProps<{
  modelValue: ShareType[];
  loading: boolean;
  options: ShareType[];
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: ShareType[]): void;
}>();

function isSelected(value: ShareType) {
  return props.modelValue.includes(value);
}

function handleClick(value: ShareType) {
  if (isSelected(value)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((x) => x !== value)
    );
  } else {
    const newModelValue = [...props.modelValue, value];
    emit('update:modelValue', newModelValue);
  }
}

function formatDividend(value: number) {
  return Rate.fromNumber(value).toString();
}
</script>

<template>
  <table class="stms selectable">
    <thead>
      <th></th>
      <th>Name</th>
      <th>Rate</th>
    </thead>
    <tbody v-if="props.options.length > 0">
      <tr
        v-for="option in options"
        :key="option.id"
        :class="{ selected: isSelected(option) }"
        @click="handleClick(option)"
      >
        <td>
          <v-checkbox
            :model-value="isSelected(option)"
            :name="`option-stms-${option.id}`"
          />
        </td>
        <td>
          {{ option.name }}
        </td>
        <td>
          {{ formatDividend(option.dividendRate) }}
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="3" class="center">No Share Types available...</td>
      </tr>
    </tbody>
  </table>
</template>
