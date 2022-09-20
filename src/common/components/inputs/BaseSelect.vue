<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from 'vue';

/**
 * A custom drop-down component with some customizability and animations.  When an item
 * is selected, the v-model is updated via an update:modelValue event.  Anonymous functions
 * may be passed in that output the name of each item.  When no item is selected, a custom
 * prompt message may be passed in as a param.
 *
 * Supports adding additional drop down items that aren't options.  Parent components can
 * listen for the select event to trigger custom functionality on the index that was clicked.
 *
 * Slots:
 *   + selected: The contents of the button containing the selected item.
 *     - option: The object/number/string currently selected.
 *     - prompt: The prompt to use when there is nothing selected.
 *   + list: Create custom list elements for each item.
 *     - options: The list of items to render.
 *     - className: The class that should be applied to each list item.
 *     - select(Item) => void: The function to call when an item is selected.
 *     - selected(index) => string: Returns the className of a selected item, if selected.
 *     - highlighted(index) => string: Returns the className of a highlighted item, if highlighted.
 *     - enter(index) => void: Should be called when the user's mouse hovers over the item.
 *   + option: The contents of each list item.  Can be used to customize the display of each list item.
 *     - option: The object/number/string being rendered.
 *   + additionalItems: Enables the insertion of additional list elements after the main list is rendered.
 *     - className: The class that should be applied to each list item.
 *     - select(Item) => void: The function to call when an item is selected.
 *     - selected(index) => string: Returns the className of a selected item, if selected.
 *     - highlighted(index) => string: Returns the className of a highlighted item, if highlighted.
 *     - enter(index) => void: Should be called when the user's mouse hovers over the item.
 */

// Function definition that returns a string representation of an item.
export type Search = (obj: unknown) => string;

const props = withDefaults(
  defineProps<{
    // The currently selected item
    modelValue: unknown;

    // The available options
    options: Readonly<Array<unknown>>;

    // A function that returns a string representing the displayed value of the item
    valueFunc?: Search;

    // A function that returns a string representing a unique key of the item
    keyFunc?: Search;

    canIncrement?: (index: number) => boolean;

    // The prompt to use when there is currently no item selected
    prompt?: string;

    // The width of the select element
    width?: string;

    // If the select element is disabled
    disabled?: boolean;

    // Set to true if the element should toggle open/closed
    shouldToggle?: boolean;
  }>(),
  {
    valueFunc: (x: unknown) => x?.toString() ?? 'UNKNOWN',
    keyFunc: (x: unknown) => {
      if (typeof x === 'object') return (x as Record<string, any>)?.id ?? x;
      return x;
    },
    canIncrement: undefined,
    prompt: 'Choose an item...',
    width: '10rem',
    disabled: false,
    shouldToggle: false,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void;
  (event: 'update:shouldToggle', value: boolean): void;
  (event: 'select', value: number): void;
}>();

// True if the select box is open
const open = ref(false);

// The current index of the highlight
const currentIndex = ref(-1);

// The number of additional items detected
const highestDetectedIndex = ref(0);

// The maximum index that can be selected
const highestIndex = computed({
  get() {
    return Math.max(props.options.length - 1, highestDetectedIndex.value);
  },

  set(val) {
    highestDetectedIndex.value = Math.max(props.options.length - 1, val);
  },
});

// Stored reference to the root element
const root = ref<HTMLButtonElement | null>(null);

// The function used to determine if the currentIndex can be incremented
const canIncrement = computed(
  () => props.canIncrement ?? ((x) => x <= highestIndex.value)
);

/**
 * Open and close the select when the user clicks on/off the button.
 */
function toggle(e?: Event) {
  if (!open.value && props.disabled) return;

  if (!e) {
    open.value = !open.value;
  } else {
    open.value = !(e?.target !== root.value);
  }
}

/**
 * Update the v-model when a new item is selected
 */
function select(index: number) {
  const item = props.options[index];

  if (item) {
    emit('update:modelValue', item);
  } else {
    emit('select', index);
  }
}

/**
 * Listen for key events and perform various actions.
 */
function onKeyup(e: KeyboardEvent) {
  // eslint-disable-next-line default-case
  switch (e.code) {
    case 'ArrowUp':
      currentIndex.value =
        currentIndex.value - 1 < 0
          ? highestIndex.value
          : currentIndex.value - 1;
      break;
    case 'ArrowDown':
      currentIndex.value = canIncrement.value(currentIndex.value + 1)
        ? currentIndex.value + 1
        : 0;
      break;
    case 'Enter':
      if (currentIndex.value === -1) break;
      select(currentIndex.value);
      toggle();
      break;
    case 'Escape':
      toggle();
      break;
  }
}

/**
 * Get the index of the selected option or return -1.
 */
function getSelectedIndex(): number {
  return props.options.indexOf(props.modelValue) ?? -1;
}

/**
 * Determines if the provided index is currently selected
 */
function selected(index: number): string {
  highestIndex.value = index;
  return index === getSelectedIndex() ? 'selected' : '';
}

/**
 * Determines if the provided index is currently highlighted
 */
function highlighted(index: number): string {
  highestIndex.value = index;
  return index === currentIndex.value ? 'highlighted' : '';
}

/**
 * Calculate an array of classes to apply to an option item.
 */
function classes(index: number) {
  highestIndex.value = Math.max(highestIndex.value, index);
  return ['select__items__item', selected(index), highlighted(index)];
}

/**
 * Event that's fired when the mouse enters an item.
 */
function enter(index: number) {
  highestIndex.value = index;
  currentIndex.value = index;
}

watchEffect(() => {
  if (open.value === true) {
    currentIndex.value = -1;
    document.addEventListener('keyup', onKeyup);
    document.addEventListener('click', toggle);
  } else {
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
  document.removeEventListener('keyup', onKeyup);
  document.removeEventListener('click', toggle);
});
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->
  <!-- eslint-disable vuejs-accessibility/mouse-events-have-key-events -->

  <div
    class="select"
    :class="{ 'select--open': open }"
    :style="{ '--width': width }"
  >
    <button
      ref="root"
      class="select__selected"
      type="button"
      :disabled="disabled"
      tabindex="0"
      @click="toggle"
    >
      <slot name="selected" :option="modelValue" :prompt="prompt">
        {{ modelValue ? valueFunc(modelValue) : prompt }}
      </slot>
    </button>

    <ul class="select__items">
      <slot
        name="list"
        class-name="select__items__item"
        :options="options"
        :highlighted="highlighted"
        :selected="selected"
        :classes="classes"
        :enter="enter"
        :select="select"
      >
        <li
          v-for="(option, index) in options"
          :key="typeof keyFunc === 'function' ? keyFunc(option) : index"
          :class="classes(index)"
          @mouseenter="enter(index)"
          @click="select(index)"
        >
          <slot name="option" :option="option">
            {{ valueFunc(option) }}
          </slot>
        </li>
      </slot>

      <slot
        name="additionalItems"
        class-name="select__items__item"
        :options="options"
        :highlighted="highlighted"
        :selected="selected"
        :classes="classes"
        :enter="enter"
        :select="select"
      />
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

.select .select__selected {
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

  background-color: hsl(var(--secondary-bg-color));
  border: 1px solid hsl(var(--secondary-bg-color-dark2));
}

.select .select__selected:after {
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

.select--open .select__selected:after {
  transform: rotate(180deg);
  top: 0.5rem;
}

.select .select__selected:focus {
  border-color: hsl(var(--accent1-bg-color));
}

.select .select__items {
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

.select .select__items__divider {
  height: auto;
  line-height: 0;
}

.select .select__items__divider hr {
  border: none;
  border-bottom: 1px solid rgb(0 0 0 / 0.2);
}

.select .select__items__item {
  padding: 0.25em;
  cursor: pointer;
}

.select .select__items__item.highlighted,
.select .select__items__item:hover {
  background-color: hsl(var(--secondary-bg-color-dark1));
}

.select .select__items__item.selected {
  color: hsl(var(--secondary-font-color) / 0.6);
  font-style: italic;
}

.select--open .select__selected {
  border-radius: var(--border-radius) var(--border-radius) 0px 0px;
}

.select--open .select__items {
  display: block;
  animation: menuOpen 300ms ease-in-out forwards;
  transform-origin: top center;
}
</style>
