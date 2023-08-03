<script setup lang="ts">
// Types
import type { Share } from '@/common/services/share';

// Utils
import Money from '@/common/utils/Money';

// Components
import { VSelect, VOption } from '@/common/components/inputs';

const props = withDefaults(
  defineProps<{
    modelValue: Share | null;

    // A list of shares
    shares: Share[];

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
  }>(),
  {
    name: undefined,
    id: undefined,
    prompt: 'Choose a Share...',
    label: undefined,
    helpText: undefined,
    width: '15rem',
    disabled: undefined,
    required: undefined,
  }
);

defineEmits<{
  (event: 'update:modelValue', value: Share): void;
}>();
</script>

<template>
  <v-select
    v-bind="{ ...props, ...$attrs }"
    :model-value="modelValue"
    @update:model-value="(value) => $emit('update:modelValue', value)"
  >
    <template #activatorLabel="{ prompt: activatorPrompt }">
      <template v-if="modelValue !== null">
        {{ 'S' + modelValue.id.toString() }}
        -
        {{ modelValue.shareType.name }}
      </template>

      <template v-else>
        {{ activatorPrompt }}
      </template>
    </template>

    <v-option v-for="share of shares" :key="share.id" :value="share">
      <div class="share-selector__item">
        <div class="share-selector__item--account-number">
          {{ 'S' + share.id.toString() }}
        </div>
        <span class="share-selector__item--description">
          {{ share.shareType.name }}
        </span>
        <span class="share-selector__item--balance">
          {{ Money.fromNumber(share.balance) }}
        </span>
      </div>
    </v-option>
  </v-select>
</template>

<style>
.share-selector__item {
  display: grid;
  grid-template-rows: 2;
  grid-template-columns: 2;
}

.share-selector__item--account_number {
  grid-column: 1;
}

.share-selector__item--description,
.share-selector__item--balance {
  grid-row: 2;
}

.share-selector__item--balance {
  text-align: right;
}
</style>
