<script lang="ts">
import {
  useAttrs,
  ref,
  computed,
  provide,
  watchEffect,
  onUnmounted,
} from 'vue';

// Utils
import useUniqueId from '@/common/composables/useUniqueId';
import useDebounce from '@/common/composables/useDebounce';
import isElementInViewport from '@/common/utils/isElementInViewport';
import { SELECT_API } from './symbols';

// Types
import type { OptionRegistration, SelectApi } from './types';

export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
interface RegisteredOptions {
  id: number;
  index: number;
  el: HTMLElement;
}

const props = withDefaults(
  defineProps<{
    // The currently selected item
    modelValue: unknown | null;

    // A unique name for this component
    name?: string;

    // A unique ID for this component
    id?: string;

    // The label displayed above the select box
    label?: string;

    // Helper text displayed above the select box
    helpText?: string;

    // If the entire select element is disabled
    disabled?: boolean;

    // If the value is required
    required?: boolean;

    // Set to true if the element should toggle open/closed
    shouldToggle?: boolean;

    // The prompt to use when there's currently no item selected
    prompt?: string;

    // The width of the select element
    width?: string;
  }>(),
  {
    id: undefined,
    name: undefined,
    label: undefined,
    helpText: undefined,
    required: undefined,
    disabled: undefined,
    prompt: 'Choose an option...',
    width: '10rem',
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown | null): void;
  (event: 'update:shouldToggle', value: boolean): void;
}>();

const attrs = useAttrs();

const inputId = computed(() => props.id ?? `input-${useUniqueId()}`);

const inputName = computed(() => props.name ?? inputId.value);

const inputAttrs = computed(() => ({
  'aria-labelledby': (props.label?.length ?? 0) > 0 ? inputId.value : undefined,
  'aria-label': (props.label?.length ?? 0) > 0 ? undefined : inputName.value,
  ...attrs,
}));

// Reference to the button, if it wasn't overwritten
const button = ref<HTMLButtonElement | null>(null);

// Reference to the element containing options
const items = ref<HTMLElement | null>(null);

// A list of registered options
const registrations = ref<RegisteredOptions[]>([]);

// True if the selector is open
const open = ref(false);

// The ID of the node that should be highlighted
const highlighted = ref<number>(-1);

// The index of the currently highlighted option
const highlightedIndex = computed(() =>
  registrations.value.findIndex((x) => x.id === highlighted.value)
);

// The classes to apply to the fieldset
const classes = computed(() => {
  const value = {
    required: props.required,
    inline: false,
  };

  if (typeof attrs.class === 'undefined') {
    value.inline = (props.label?.trim() ?? '').length === 0;
  }

  return [
    'fieldset',
    value,
    attrs.class as string | string[] | Record<string, boolean> | undefined,
  ];
});

/**
 * Toggle the selector open or closed, if enabled.
 */
const toggle = useDebounce((e?: Event) => {
  // @NOTE: Blurring the button allows the 'Enter' keypress to trigger
  if (e && !open.value) {
    (e.target as HTMLButtonElement).blur();
  }

  if (!open.value && props.disabled) return;

  if (open.value && button.value !== null) {
    // Focus the button again unless Tab was pressed
    if ((e as KeyboardEvent | undefined)?.code !== 'Tab' ?? true) {
      button.value.focus();
    }
  }

  open.value = !open.value;
}, 10);

// The last ID number issued to an option
let latestId = 0;

const api: SelectApi = {
  register(el) {
    registrations.value.push({
      id: latestId,
      index: -1,
      el,
    });

    const response: OptionRegistration = {
      id: latestId,

      unregister: ((id: number) => () => {
        registrations.value = registrations.value.filter((x) => x.id !== id);
      })(latestId),
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

/**
 * Scroll the highlighted option into view.
 */
function scrollHighlighted() {
  const selected = registrations.value[highlightedIndex.value].el;

  if (!isElementInViewport(selected)) {
    selected.scrollIntoView({
      behavior: 'smooth',
    });
  }
}

/**
 * Move the highlighted option upwards, or wrap around
 */
function arrowUp() {
  if (highlightedIndex.value <= 0) {
    highlighted.value =
      registrations.value[registrations.value.length - 1]?.id ?? -1;
  } else {
    highlighted.value = registrations.value[highlightedIndex.value - 1].id;
  }

  scrollHighlighted();
}

/**
 * Move the highlighted option downward or wrap around
 */
function arrowDown() {
  if (highlightedIndex.value >= registrations.value.length - 1) {
    highlighted.value = registrations.value[0]?.id ?? -1;
  } else {
    highlighted.value = registrations.value[highlightedIndex.value + 1].id;
  }

  scrollHighlighted();
}

/**
 * Listen for key events and perform various actions.
 */
function onKeyup(e: KeyboardEvent) {
  // eslint-disable-next-line default-case
  switch (e.code) {
    case 'Enter':
    case 'Tab':
      if (highlighted.value === -1) break;
      registrations.value[highlightedIndex.value].el.click();
      toggle(e);
      break;
    case 'Escape':
      e.preventDefault();
      toggle();
      break;
  }
}

/**
 * Listen for key events and perform various actions, including when the users holds a key down.
 */
function onKeydown(e: KeyboardEvent) {
  // eslint-disable-next-line default-case
  switch (e.code) {
    case 'ArrowUp':
      e.preventDefault();
      arrowUp();
      break;
    case 'ArrowDown':
      e.preventDefault();
      arrowDown();
      break;
  }
}

/**
 * Calculate the indices of the options objects and sort them for keyboard support.
 */
function calculateIndices() {
  if (items.value === null) return;

  const allElements = Array.from(items.value.querySelectorAll('*'));
  registrations.value.forEach((value, index) => {
    const elementIndex = allElements.indexOf(value.el);
    registrations.value[index].index = elementIndex;
  });

  registrations.value.sort((a, b) => a.index - b.index);
}

watchEffect(() => {
  if (open.value === true) {
    highlighted.value = -1;
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('keyup', onKeyup);
    document.addEventListener('click', toggle);
    calculateIndices();
  } else {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('keyup', onKeyup);
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
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('keyup', onKeyup);
  document.removeEventListener('click', toggle);
});

provide(SELECT_API, api);
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->
  <!-- eslint-disable vuejs-accessibility/mouse-events-have-key-events -->

  <div :class="classes">
    <slot
      :id="inputId"
      :attrs="inputAttrs"
      :help-text="helpText"
      :input-name="name"
      :label="label"
      :model-value="modelValue"
      :required="required"
      :activate="toggle"
      name="label"
    >
      <label v-if="label" :for="inputId" @click.prevent="toggle">
        <template v-if="required">
          {{ label }}<span class="required">*</span>
        </template>
        <template v-else>
          {{ label }}
        </template>
      </label>
    </slot>

    <slot
      :id="inputId"
      :attrs="inputAttrs"
      :classes="{ 'help-text': true }"
      :help-text="helpText"
      :input-name="name"
      :label="label"
      :model-value="modelValue"
      :required="required"
      :activator="toggle"
      name="help"
    >
      <p v-if="helpText" class="help-text">
        {{ helpText }}
      </p>
    </slot>

    <div
      class="select"
      :class="{ open }"
      :style="{ '--width': props.width }"
      @mouseleave="api.emit.highlight(-1)"
    >
      <slot
        name="activator"
        :activate="toggle"
        :disabled="props.disabled"
        :attrs="inputAttrs"
      >
        <button
          ref="button"
          class="select__button"
          type="button"
          tabindex="0"
          :disabled="props.disabled"
          @click="toggle"
        >
          <slot name="activatorLabel" :prompt="props.prompt">
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
  </div>
</template>

<style>
@keyframes menu-open {
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
  display: inline-block;
}

.select__button {
  position: relative;
  outline: 0;
  margin: 0;
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
  border-color:
    hsl(var(--clr-primary-400) / 0.9)
    transparent
    transparent
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
  z-index: 1;
  list-style: none;
  margin: 0;
  max-height: clamp(150px, 30vh, 350px);
  overflow-y: auto;
  user-select: none;
  width: var(--width);
  background-color: hsl(var(--clr-neutral-300));
  border: 1px solid hsl(var(--clr-neutral-400));
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.select.open .select__items {
  display: block;
  animation: menu-open 300ms ease-in-out forwards;
  transform-origin: top center;
}
</style>
