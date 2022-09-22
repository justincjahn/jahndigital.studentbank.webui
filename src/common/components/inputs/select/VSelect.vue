<script lang="ts" setup>
import type { Ref } from 'vue';
import {
  ref,
  reactive,
  computed,
  provide,
  watchEffect,
  onUnmounted,
} from 'vue';
import useDebounce from '@/common/composables/useDebounce';
import type { OptionRegistration, SelectApi } from './types';
import { SELECT_API } from './symbols';

interface RegisteredOptions {
  index: Ref<number>;
  el: HTMLElement;
}

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

// Reference to the element containing options
const items = ref<HTMLElement | null>(null);

// A list of registered options
const registrations = reactive<Record<number, RegisteredOptions>>({});

// True if the selector is open
const open = ref(false);

// The ID of the node that should be highlighted
const highlighted = ref<number>(-1);

// The last ID number issued to an option
let latestId = 0;

const api: SelectApi = {
  register(el) {
    if (items.value === null) {
      throw new Error('Item ref is null.');
    }

    let index = -1;
    for (let i = 0; i < items.value.children.length; i += 1) {
      if (items.value.children[i].contains(el)) {
        index = i;
        break;
      }
    }

    registrations[latestId] = {
      index: ref(index),
      el,
    };

    const response: OptionRegistration = {
      id: latestId,

      unregister() {
        delete registrations[latestId];
      },
    };

    latestId += 1;
    return response;
  },

  emit: {
    highlight(id) {
      highlighted.value = id;
    },

    select(value) {
      emit('update:modelValue', value);
    },
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
    @mouseleave="api.emit.highlight(-1)"
  >
    <slot name="activator" :activate="toggle" :disabled="props.disabled">
      <button
        class="select__button"
        type="button"
        tabindex="0"
        :disabled="props.disabled"
        @click="toggle"
      >
        <slot name="activatorLabel">
          {{ props.modelValue?.toString() ?? props.prompt }}
        </slot>
      </button>
    </slot>

    <slot name="items">
      <ul ref="items" class="select__items">
        <slot />
      </ul>
    </slot>
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
