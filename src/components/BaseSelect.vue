<template>
  <div class="select" :class="{ 'select--open': open }">
    <button
      ref="root"
      class="select__selected"
      :class="{ 'select__selected--open': open }"
      @click="toggle"
    >
      <slot name="selected" :option="modelValue" :prompt="prompt">
        {{ modelValue ? value(modelValue) : prompt }}
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
        :className="'select__items__item'"
        :select="select"
      >
        <li
          v-for="option in options"
          :key="key(option)"
          class="select__items__item"
          @click="select(option)"
        >
          <slot name="option" :option="option">
            {{ value(option) }}
          </slot>
        </li>
      </slot>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, PropType } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item = Record<string, any>|number|string|null;
export type Search = <T extends Item>(obj: T) => string;

/**
 * A custom drop-down component with some customizability and animations.  When an item
 * is selected, the v-model is updated via an update:modelValue event.  Anonymous functions
 * may be passed in that output the name of each item.  When no item is selected, a custom
 * prompt message may be passed in as a param.
 *
 * Slots:
 *   + selected: The contents of the button containing the selected item.
 *     - option: The object/number/string currently selected.
 *     - prompt: The promp to use when there is nothing selected.
 *   + list: Create custom list elements for each item.
 *     - options: The list of items to render.
 *     - className: The class that should be applied to each list item.
 *     - select: The function to call when an item is selected.  Add it to each list items @click event.
 *   + option: The contents of each list item.  Can be used to customize the display of each list item.
 *     - option: The object/number/string being rendered.
 */
export default defineComponent({
  props: {
    modelValue: {
      type: [Object, Number, String] as PropType<Item>,
      default: null,
    },
    options: {
      type: Array as PropType<Readonly<Item[]>>,
      required: true,
    },
    value: {
      type: Function as PropType<Search>,
      required: false,
      default: (x: Readonly<Item>) => x,
    },
    key: {
      type: Function as PropType<Search>,
      required: false,
      default: (x: Readonly<Item>) => {
        if (typeof x === 'object') return x?.id ?? x;
        return x;
      },
    },
    prompt: {
      type: String,
      required: false,
      default: 'Choose an item...',
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(_, { emit }) {
    const open = ref(false);
    const root = ref<HTMLButtonElement|null>(null);

    // Open and close the select when the user clicks on/off the button.
    function toggle(e: Event) { open.value = !(e.target !== root.value); }

    // Update the v-model when a new item is selected
    function select(item: Item) { emit('update:modelValue', item); }

    // Register/unregister a global click event that toggles the selector
    onMounted(() => { document.addEventListener('click', toggle); });
    onUnmounted(() => { document.removeEventListener('click', toggle); });

    return {
      root,
      open,
      toggle,
      select,
    };
  },
});
</script>

<style lang="scss">
@keyframes menuOpen {
  0% {
    transform: scaleY(0)
  }
  80% {
    transform: scaleY(1.1)
  }
  100% {
    transform: scaleY(1)
  }
}

.select {
  position: relative;
  display: inline-block;

  &__selected {
    position: relative;
    min-width: 10rem;
    text-align: left;
    vertical-align: middle;
    margin: 0;
    padding-right: 2em;
    outline: 0;
    border: 1px solid colorStep(button-secondary, $step: 2);
    border-radius: 0.25rem;
    color: map.get($theme, button-secondary, font-color);
    background-color: map.get($theme, button-secondary, color);

    &:after {
      position: absolute;
      content: "";
      top: 0.8rem;
      right: 0.5rem;
      width: 0;
      height: 0;
      border: 5px solid transparent;
      border-color:
        map.get($theme, button-secondary, font-color)
        transparent
        transparent
        transparent;
    }
  }

  &__items {
    display: none;
    position: absolute;
    z-index: 999;
    list-style: none;
    margin: 0;
    width: 100%;
    max-height: clamp(150px, 30vh, 350px);
    overflow-y: auto;

    background-color: map.get($theme, button-secondary, color);
    border: 1px solid colorStep(button-secondary, $step: 2);

    &__divider {
      height: auto;
      line-height: 0;

      & hr {
        border: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      }
    }

    &__item {
      padding: 0.25em;
      cursor: pointer;

      &:hover {
        background-color: colorStep(button-secondary);
      }
    }
  }

  &--open &__selected {
    border-radius: 0.25rem 0.25rem 0px 0px;
  }

  &--open &__items {
    display: block;
    animation: menuOpen 300ms ease-in-out forwards;
    transform-origin: top center;
  }
}
</style>
