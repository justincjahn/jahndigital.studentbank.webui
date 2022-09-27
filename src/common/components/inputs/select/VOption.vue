<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, useAttrs } from 'vue';
import injectStrict from '@/common/utils/injectStrict';
import type { OptionRegistration } from './types';
import { SELECT_API } from './symbols';

const props = withDefaults(
  defineProps<{
    // The value this option represents
    value?: string | number | Record<any, any> | null;

    // If the item is disabled
    disabled?: boolean;
  }>(),
  {
    value: null,
    disabled: false,
  }
);

const attrs = useAttrs();
const root = ref<HTMLElement | null>(null);
const api = injectStrict(SELECT_API);
let registration: OptionRegistration | null = null;

const styles = computed(() => ({
  selected: api.selected.value === props.value,
  highlighted: api.highlighted.value === registration?.id,
  disabled: props.disabled,
}));

function select() {
  if (props.disabled) return;
  if (attrs?.onClick ?? false) return;
  api.emit.select(props.value);
}

function highlight() {
  api.emit.highlight(registration?.id ?? -1);
}

onMounted(() => {
  if (root.value === null) return;
  registration = api.register(root.value);
});

onUnmounted(() => {
  if (registration === null) return;
  registration.unregister();
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
    @mouseenter="highlight"
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
