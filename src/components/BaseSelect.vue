<template>
  <div class="select" :class="{ 'select--open': open }">
    <button
      ref="root"
      class="select__selected"
      type="button"
      :class="{ 'select__selected--open': open }"
      :disabled="disabled"
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
        :selected="selected"
        :select="select"
      >
        <li
          v-for="option in options"
          :key="key(option)"
          class="select__items__item"
          :class="selected(option)"
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
import { defineComponent, onUnmounted, ref, PropType, watchEffect } from 'vue';

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
 *     - selected: Should be called in the class prop for each option.  Outputs the className for the currently selected option.
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
    width: {
      type: String,
      required: false,
      default: '10rem',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    // True if the select box is open
    const open = ref(false);

    // Stored reference to the root element
    const root = ref<HTMLButtonElement|null>(null);

    // Open and close the select when the user clicks on/off the button.
    function toggle(e?: Event) {
      if (!open.value && props.disabled) return;

      if (!e) {
        open.value = !open.value;
      } else {
        open.value = !(e?.target !== root.value);
      }
    }

    // Update the v-model when a new item is selected
    function select(item: Item) { emit('update:modelValue', item); }

    // Determines if the provided item is currently selected
    function selected(item: Item) { return props.key(props.modelValue) === props.key(item) ? 'selected' : ''; }

    // Register global click event when the box is opened and unregister when it closes
    watchEffect(() => {
      if (open.value === true) {
        document.addEventListener('click', toggle);
      } else {
        document.removeEventListener('click', toggle);
      }
    });

    // Unregister a global click event that toggles the selector
    onUnmounted(() => { document.removeEventListener('click', toggle); });

    return {
      root,
      open,
      toggle,
      select,
      selected,
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
  $width: 10rem;
  $fontColor: map.get($theme, button-secondary, font-color);

  position: static;
  display: inline-block;

  &__selected {
    position: relative;
    margin: 0;
    outline: 0;
    width: $width;

    line-height: 1.25em;
    text-align: left;
    vertical-align: middle;
    padding-right: 2em;
    color: $fontColor;

    // Overflow turns into ...
    user-select: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    background-color: map.get($theme, button-secondary, color);
    border: 1px solid colorStep(button-secondary, $step: 2);
    border-radius: 0.25rem;

    &:after {
      position: absolute;
      content: "";
      top: 0.8rem;
      right: 0.5rem;
      width: 0;
      height: 0;
      border: 5px solid transparent;
      border-color:
        rgba(map.get($theme, button-secondary, font-color), 0.7)
        transparent
        transparent
        transparent;

      transition: transform 0.1s ease-in-out, top 0.1s ease-in-out;
      transform-origin: center;
    }

    &--open:after {
      transform: rotate(180deg);
      top: 0.5rem;
    }
  }

  &__items {
    position: absolute;
    display: none;
    z-index: 800;
    list-style: none;
    margin: 0;
    max-height: clamp(150px, 30vh, 350px);
    overflow-y: auto;
    user-select: none;
    width: $width;

    background-color: map.get($theme, button-secondary, color);
    border: 1px solid colorStep(button-secondary, $step: 2);
    border-radius: 0 0 0.25rem 0.25rem;

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

      &.selected {
        color: rgba($fontColor, .3);
        cursor: auto;

        &:hover {
          background-color: inherit;
        }
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
