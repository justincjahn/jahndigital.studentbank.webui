<script lang="ts" setup>
import { ref, computed, provide } from 'vue';
import type { SelectApi } from './types';
import { SELECT_API } from './symbols';

const props = withDefaults(
  defineProps<{
    modelValue: unknown | null;
    prompt?: string;
    width?: string;
  }>(),
  {
    prompt: 'Choose an option...',
    width: '10rem',
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown | null): void;
}>();

const registeredOptions = new Set<unknown>();

const highlighted = ref<unknown | null>();

const open = ref(false);

const api: SelectApi = {
  register(option) {
    registeredOptions.add(option);

    return () => {
      registeredOptions.delete(option);
    };
  },

  highlight(value) {
    highlighted.value = value;
  },

  select(value) {
    emit('update:modelValue', value);
  },

  selected: computed(() => props.modelValue),

  highlighted: computed(() => highlighted.value),
};

function toggle() {
  open.value = !open.value;
}

provide(SELECT_API, api);
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->
  <!-- eslint-disable vuejs-accessibility/mouse-events-have-key-events -->
  <div
    class="select"
    :class="{ open }"
    :style="{ '--width': props.width }"
    @click="toggle"
    @mouseleave="api.highlight(null)"
  >
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

<style>
@keyframes menuOpen {
  0% {
    transform: scaleY(0);
  }
  80% {
    transform: scaleY(1.1);
  }
  100% {
    transform: scaleY(1);
  }
}

.select {
  position: static;
  display: inline-block;
}

.select__button {
  position: relative;
  margin: 0;
  outline: 0;
  width: var(--width);
  text-align: left;
  vertical-align: middle;
  padding-right: 2em;
  color: hsl(var(--secondary-font-color));

  user-select: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.select.open .select__button {
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.select__button:after {
  position: absolute;
  content: '';
  top: 0.8rem;
  right: 0.5rem;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-color: hsl(var(--secondary-font-color) / 0.9) transparent transparent
    transparent;
  transition: transform 0.1s ease-in-out, top 0.1s ease-in-out;
  transform-origin: center;
}

.select.open .select__button:after {
  transform: rotate(180deg);
  top: 0.5rem;
}

.select__items {
  position: absolute;
  display: none;
  z-index: 800;
  list-style: none;
  margin: 0;
  max-height: clamp(150px, 30vh, 350px);
  overflow-y: auto;
  user-select: none;
  width: var(--width);
  background-color: hsl(var(--secondary-bg-color));
  border: 1px solid hsl(var(--secondary-bg-color-dark2));
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.select.open .select__items {
  display: block;
  animation: menuOpen 300ms ease-in-out forwards;
  transform-origin: top center;
}

.select__items__item {
  padding: 0.25em;
  cursor: pointer;
}

.select__items__item.highlighted {
  background-color: hsl(var(--secondary-bg-color-dark1));
}
</style>
