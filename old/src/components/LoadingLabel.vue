<template>
  <div
    v-if="show"
    class="loading-label"
  >
    <dollar-icon />

    <div class="loading-label__content">
      <slot>
        Please wait...
      </slot>
    </div>
  </div>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import DollarIcon from './DollarIcon.vue';

withDefaults(defineProps<{
  show?: boolean
}>(), {
  show: false,
});
</script>

<style lang="scss">
.loading-label {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;

  &__content {
    font-size: 1em;
    margin: 0.1em 0 0 0.5em;
    align-self: center;
  }
}
</style>
