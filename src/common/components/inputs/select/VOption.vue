<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import injectStrict from '@/common/utils/injectStrict';
import { SELECT_API } from './symbols';

const props = defineProps<{
  value: unknown;
}>();

// let unregister: (() => void) | null = null;
const root = ref<HTMLElement | null>(null);
const api = injectStrict(SELECT_API);
let unregister: (() => void) | null = null;

const styles = computed(() => ({
  selected: api.selected.value === props.value,
  highlighted: api.highlighted.value === props.value,
}));

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
    @click="api.select(props.value)"
    @mouseenter="api.highlight(props.value)"
  >
    <slot>{{ props.value?.toString() ?? '' }}</slot>
  </li>
</template>
