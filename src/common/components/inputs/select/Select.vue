<script lang="ts" setup>
import { provide, computed } from 'vue';
import type { SelectApi } from './types';
import { SELECT_API } from './symbols';

const props = withDefaults(
  defineProps<{
    modelValue: unknown | null;
    prompt?: string;
  }>(),
  {
    prompt: 'Choose an option...',
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown | null): void;
}>();

const registeredOptions = new Set<unknown>();

const api: SelectApi = {
  register(option) {
    registeredOptions.add(option);

    return () => {
      registeredOptions.delete(option);
    };
  },

  selected: computed(() => props.modelValue),

  select(value) {
    emit('update:modelValue', value);
  },
};

provide(SELECT_API, api);
</script>

<template>
  <div class="select">
    <button class="select__button" type="button" tabindex="0">
      <slot name="button">
        {{ props.modelValue?.toString() ?? props.prompt }}
      </slot>
    </button>

    <ul class="select__items">
      <slot />
    </ul>
  </div>
</template>
