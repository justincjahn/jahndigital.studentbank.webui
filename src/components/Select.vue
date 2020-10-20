<template>
  <div class="select">
    <div
      class="select__selected"
      @click="toggleOpen"
      :class="{ 'select__selected--open': open }"
    >
        {{value(selected)}}
    </div>
    <div class="select__items" :class="{ 'select__items--hidden': !open }">
      <div
        v-for="option of options"
        :key="key(option)"
        @click="select(option)"
      >
        <span class="select__items__item">{{value(option)}}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watchEffect } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
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
  },

  setup(props, { emit }) {
    const open = ref(false);
    const selected = ref<Item|null>(null);

    watchEffect(() => {
      if (props.default !== null) {
        selected.value = props.default;
      } else if (props.options.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        selected.value = props.options[0];
      }
    });

    function toggleOpen() {
      open.value = !open.value;
    }

    function select(item: Item) {
      selected.value = item;
      toggleOpen();
      emit('select', item);
    }

    return {
      open,
      selected,
      select,
      toggleOpen,
    };
  },
});
</script>

<style lang="scss">
div.select {
  position: relative;
  text-align: left;
  outline: none;
  height: 2em;
  line-height: 2em;

  & .select__selected {
    padding-left: 1em;
    cursor: pointer;
    user-select: none;
    min-height: 2em;

    border-radius: 3px;
    border: 1px solid darken(
      map.get($theme, button-primary, color),
      map.get($theme, button-primary, step)
    );

    color: map.get($theme, button-primary, font-color);
    background-color: map.get($theme, button-primary, color);

    &:after {
      position: absolute;
      content: "";
      top: 1rem;
      right: 1rem;
      width: 0;
      height: 0;
      border: 5px solid transparent;
      border-color:
        map.get($theme, button-primary, font-color)
        transparent transparent transparent;
    }

    &.select__selected--open {
      border-radius: 3px 3px 0px 0px;
    }
  }

  & .select__items {
    color: map.get($theme, button-primary, font-color);
    border-radius: 0px 0px 3px 3px;
    overflow: hidden;
    position: absolute;
    background-color: map.get($theme, button-primary, color);
    left: 0;
    right: 0;
    z-index: 1;

    &.select__items--hidden {
      display: none;
    }

    & .select__items__item {
      display: block;
      cursor: pointer;
      user-select: none;
      padding-left: 1em;
      width: 100%;
      border-top: 1px solid darken(
        map.get($theme, button-primary, color),
        map.get($theme, button-primary, step)
      );

      &:hover {
        background-color: lighten(
          map.get($theme, button-primary, color),
          5%
        );
      }
    }
  }
}
</style>
