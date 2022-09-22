<script lang="ts" setup>
import { ref, computed, provide, watchEffect, onUnmounted } from 'vue';
import useDebounce from '@/common/composables/useDebounce';
import type { SelectApi } from './types';
import { SELECT_API } from './symbols';

const props = withDefaults(
  defineProps<{
    // The currently selected item
    modelValue: unknown | null;

    // The prompt to use when there's currently no item selected
    prompt?: string;

    // The width of the select element
    width?: string;

    // If the entire select element is disabled
    disabled?: boolean;

    // Set to true if the element should toggle open/closed
    shouldToggle?: boolean;
  }>(),
  {
    prompt: 'Choose an option...',
    width: '10rem',
    disabled: false,
    shouldToggle: false,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown | null): void;
  (event: 'update:shouldToggle', value: boolean): void;
}>();

const root = ref<HTMLButtonElement | null>(null);

const items = ref<HTMLElement | null>(null);

const open = ref(false);

const highlighted = ref<unknown | null>();

const registeredOptions = new Set<unknown>();

const api: SelectApi = {
  register(option, el) {
    registeredOptions.add(option);

    if (items.value !== null) {
      console.log(Array.from(items.value.children).indexOf(el));
    }

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

provide(SELECT_API, api);

const toggle = useDebounce(() => {
  if (!open.value && props.disabled) return;
  open.value = !open.value;
}, 10);

watchEffect(() => {
  if (open.value === true) {
    document.addEventListener('click', toggle);
  } else {
    document.removeEventListener('click', toggle);
  }
});

watchEffect(() => {
  if (props.shouldToggle === true) {
    toggle();
    emit('update:shouldToggle', false);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', toggle);
});
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->
  <!-- eslint-disable vuejs-accessibility/mouse-events-have-key-events -->
  <div
    class="select"
    :class="{ open }"
    :style="{ '--width': props.width }"
    @click.prevent="toggle"
    @mouseleave="api.highlight(null)"
  >
    <button
      ref="root"
      class="select__button"
      type="button"
      tabindex="0"
      :disabled="props.disabled"
    >
      <slot name="button">
        {{ props.modelValue?.toString() ?? props.prompt }}
      </slot>
    </button>

    <ul ref="items" class="select__items">
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
</style>
