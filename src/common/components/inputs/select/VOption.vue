<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import injectStrict from '@/common/utils/injectStrict';
import { SELECT_API } from './symbols';

const props = withDefaults(
  defineProps<{
    // The value this option represents
    value: unknown;

    // If the item is disabled
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

const root = ref<HTMLElement | null>(null);
const api = injectStrict(SELECT_API);
let unregister: (() => void) | null = null;

const styles = computed(() => ({
  selected: api.selected.value === props.value,
  highlighted: api.highlighted.value === props.value,
  disabled: props.disabled,
}));

function select() {
  if (props.disabled) return;
  api.select(props.value);
}

onMounted(() => {
  if (root.value === null) return;
  unregister = api.register(props.value, root.value);
});

onUnmounted(() => {
  if (unregister === null) return;
  unregister();
});
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->
  <!-- eslint-disable vuejs-accessibility/mouse-events-have-key-events -->
  <li
    ref="root"
    class="select__items__item"
    :class="styles"
    @click="select"
    @mouseenter="api.highlight(props.value)"
  >
    <slot>{{ props.value?.toString() ?? '' }}</slot>
  </li>
</template>

<style>
.select__items__item {
  padding: 0.25em;
  cursor: pointer;
}

.select__items__item.highlighted {
  background-color: hsl(var(--secondary-bg-color-dark1));
}

.select__items__item.disabled {
  cursor: inherit;
  font-style: italic;
  color: hsl(var(--secondary-font-color) / 0.4);
}

.select__items__item.disabled.highlighted {
  background-color: inherit;
}
</style>
