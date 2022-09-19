<script setup lang="ts">
import { onUnmounted, ref, watchEffect } from 'vue';

/**
 * A custom drop-down component with some customizability and animations.  When an item
 * is selected, the v-model is updated via an update:modelValue event.  Anonymous functions
 * may be passed in that output the name of each item.  When no item is selected, a custom
 * prompt message may be passed in as a param.
 *
 * Slots:
 *   + selected: The contents of the button containing the selected item.
 *     - option: The object/number/string currently selected.
 *     - prompt: The prompt to use when there is nothing selected.
 *   + list: Create custom list elements for each item.
 *     - options: The list of items to render.
 *     - className: The class that should be applied to each list item.
 *     - select(Item): The function to call when an item is selected.
 *     - selected(Item): Should be called in the class prop for each option.  Returns a boolean.
 *     - highlighted(Item): Should should be called to determine if the item is highlighted.  Returns a boolean.
 *     - enter(Item): Should be called when the user's mouse hovers over the item.
 *   + option: The contents of each list item.  Can be used to customize the display of each list item.
 *     - option: The object/number/string being rendered.
 */

/**
 * Function definition that returns a string representation of an item.
 */
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
    prompt: 'Choose an item...',
    width: '10rem',
    disabled: false,
    shouldToggle: false,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void;
  (event: 'update:shouldToggle', value: boolean): void;
}>();

// True if the select box is open
const open = ref(false);

// The current index of the highlight
const currentIndex = ref(-1);

// Stored reference to the root element
const root = ref<HTMLButtonElement | null>(null);

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
function select(item: unknown) {
  emit('update:modelValue', item);
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
          ? props.options.length - 1
          : currentIndex.value - 1;
      break;
    case 'ArrowDown':
      currentIndex.value =
        currentIndex.value + 1 >= props.options.length
          ? 0
          : currentIndex.value + 1;
      break;
    case 'Enter':
      if (currentIndex.value === -1) break;
      select(props.options[currentIndex.value]);
      toggle();
      break;
    case 'Escape':
      toggle();
      break;
  }
}

/**
 * Determines if the provided item is currently selected
 */
function selected(item: unknown): boolean {
  if (typeof props.keyFunc !== 'function') return false;
  return props.keyFunc(props.modelValue) === props.keyFunc(item);
}

/**
 * Determines if the provided index is currently highlighted
 */
function highlighted(item: unknown): boolean {
  return item === props.options[currentIndex.value];
}

/**
 * Event that's fired when the mouse enters an item.
 */
function enter(item: unknown) {
  const index = props.options.indexOf(item);
  currentIndex.value = index;
}

// Register global click event when the box is opened and unregister when it closes
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

// Unregister a global click event that toggles the selector
onUnmounted(() => {
  document.removeEventListener('keyup', onKeyup);
  document.removeEventListener('click', toggle);
});
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->
  <!-- eslint-disable vuejs-accessibility/mouse-events-have-key-events -->

  <div class="select" :class="{ 'select--open': open }">
    <button
      ref="root"
      class="select__selected"
      type="button"
      :class="{ 'select__selected--open': open }"
      :disabled="disabled"
      tabindex="0"
      @click="toggle"
    >
      <slot name="selected" :option="modelValue" :prompt="prompt">
        {{ modelValue ? valueFunc(modelValue) : prompt }}
      </slot>
    </button>
    <ul
      v-if="options.length > 0 || true"
      class="select__items"
      :class="{ 'select__items--hidden': !open }"
    >
      <slot
        name="list"
        :options="options"
        :class-name="'select__items__item'"
        :selected="selected"
        :highlighted="highlighted"
        :enter="enter"
        :select="select"
      >
        <li
          v-for="option in options"
          :key="typeof keyFunc === 'function' ? keyFunc(option) : ''"
          class="select__items__item"
          :class="{
            selected: selected(option),
            highlighted: highlighted(option),
          }"
          @click="select(option)"
          @mouseenter="() => enter(option)"
        >
          <slot name="option" :option="option">
            {{ valueFunc(option) }}
          </slot>
        </li>
      </slot>
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
  --width: 10rem;
  position: static;
  display: inline-block;
}

.select .select__selected {
  position: relative;
  margin: 0;
  outline: 0;
  width: var(--width);
  height: 2rem;
  line-height: 1.25em;
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
  border-radius: 0.25rem;
}

.select .select__selected:after {
  position: absolute;
  content: '';
  top: 0.8rem;
  right: 0.5rem;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-color: hsla(var(--secondary-font-color) / 0.9) transparent transparent
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
  border-radius: 0 0 0.25rem 0.25rem;
}

.select .select__items__divider {
  height: auto;
  line-height: 0;
}

.select .select__items__divider hr {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.select .select__items__item {
  padding: 0.25em;
  cursor: pointer;
}

.select .select__items__item.highlighted {
  background-color: hsl(var(--secondary-bg-color-dark1));
}

.select .select__items__item.selected {
  color: hsla(var(--secondary-font-color) / 0.6);
  font-style: italic;
  /* cursor: auto; */
}

/* .select .select__items__item.selected.highlighted {
  background-color: inherit;
} */

.select--open .select__selected {
  border-radius: 0.25rem 0.25rem 0px 0px;
}

.select--open .select__items {
  display: block;
  animation: menuOpen 300ms ease-in-out forwards;
  transform-origin: top center;
}
</style>
