<template>
  <div class="select" :class="{ 'select--open': open }">
    <div
      class="select__selected"
      @click="toggleOpen"
      :class="{ 'select__selected--open': open }"
      ref="root"
    >
      <slot name="selected" v-bind="selected ?? {}">
        {{selected ? value(selected) : msg}}
      </slot>
    </div>
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
.select {
  position: relative;
  text-align: left;
  outline: none;
  height: 2em;
  line-height: 2em;
}

.select__items {
  color: map.get($theme, button-primary, font-color);
  border-radius: 0px 0px 3px 3px;
  overflow: hidden;
  position: absolute;
  background-color: map.get($theme, button-primary, color);
  box-shadow: 8px 8px 14px -6px rgba(0,0,0,0.2);
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  margin: 0;

  max-height: 300px;
  overflow-y: auto;
}

.select__items--hidden {
  display: none;
}

.select__selected {
  padding-left: 0.25em;
  cursor: pointer;
  user-select: none;
  min-height: 2em;
  font-weight: 600;

  border-radius: 3px;
  border: 1px solid colorStep(button-primary);
  color: map.get($theme, button-primary, font-color);
  background-color: map.get($theme, button-primary, color);

  &:after {
    position: absolute;
    content: "";
    top: 1rem;
    right: 0.5rem;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-color:
      map.get($theme, button-primary, font-color)
      transparent transparent transparent;
  }
}

.select__selected--open {
  border-radius: 3px 3px 0px 0px;
}

.select__items__item {
  display: block;
  cursor: pointer;
  user-select: none;
  padding-left: 0.25em;
  width: 100%;
  border-top: 1px solid colorStep(button-primary);

  &:hover {
    background-color: colorStep(button-primary, $step: 1, $darken: false);
  }
}
</style>
