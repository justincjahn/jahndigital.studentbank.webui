<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import injectStrict from '@/common/utils/injectStrict';
import { SELECT_API } from './symbols';

const props = defineProps<{
  value: unknown;
}>();

let unregister: (() => void) | null = null;
const api = injectStrict(SELECT_API);

onMounted(() => {
  unregister = api.register(props.value);
});

onUnmounted(() => {
  if (unregister === null) return;
  unregister();
});
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->

  <li
    class="select__items__item"
    :class="{ selected: api.selected.value === props.value }"
    @click="api.select(props.value)"
  >
    <slot>{{ props.value?.toString() ?? '' }}</slot>
  </li>
</template>
