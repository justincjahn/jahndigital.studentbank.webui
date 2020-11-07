<template>
  <div class="select" :class="{ 'select--open': open }">
    <button
      class="select__selected"
      @click="toggleOpen"
      :class="{ 'select__selected--open': open }"
      ref="root"
    >
      <slot name="selected" v-bind="selected ?? {}">
        {{selected ? value(selected) : msg}}
      </slot>
    </button>
    <ul class="select__items" :class="{ 'select__items--hidden': !open }" v-if="options && options.length > 0">
      <slot name="list" v-bind="slotProps()">
        <li
          v-for="option in options"
          :key="key(option)"
          @click="select(option)"
          class="select__items__item"
        >
          <slot name="option" v-bind="option">{{value(option)}}</slot>
        </li>
      </slot>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, PropType, ref, watchEffect } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>|null;
type Search = <T extends Item>(obj: T) => string;

export default defineComponent({
  props: {
    options: {
      type: Array as PropType<Item[]>,
      required: true,
    },
    default: {
      type: Object as PropType<Item>,
      required: false,
      default: null,
    },
    value: {
      type: Function as PropType<Search>,
      required: false,
      default: (x: Item) => x,
    },
    key: {
      type: Function as PropType<Search>,
      required: false,
      default: (x: Item) => x,
    },
    msg: {
      type: String,
      required: false,
      default: 'Choose an item...',
    },
  },
  setup(props, { emit }) {
    const open = ref(false);
    const selected = ref<Item|null>(null);
    const root = ref<HTMLDivElement|null>(null);

    function toggleOpen(e: Event) {
      if (e.target !== root.value) {
        open.value = false;
      } else {
        open.value = true;
      }
    }

    watchEffect(() => {
      if (props.default !== null) {
        selected.value = props.default;
      }
    });

    onMounted(() => {
      document.addEventListener('click', toggleOpen);
    });

    onUnmounted(() => {
      document.removeEventListener('click', toggleOpen);
    });

    function select(item: Item) {
      selected.value = item;
      emit('select', item);
    }

    function slotProps() {
      const ops = props.options;

      return {
        selected,
        options: ops,
        select,
        class: 'select__items__item',
      };
    }

    return {
      open,
      selected,
      select,
      toggleOpen,
      root,
      slotProps,
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
    z-index: 100;
    list-style: none;
    margin: 0;
    width: 100%;
    max-height: clamp(150px, 30vh, 350px);
    overflow-y: auto;

    background-color: map.get($theme, button-secondary, color);
    border: 1px solid colorStep(button-secondary, $step: 2);

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
