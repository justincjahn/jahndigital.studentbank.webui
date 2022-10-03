<script setup lang="ts">
import DollarIcon from '@/common/components/DollarIcon.vue';

withDefaults(
  defineProps<{
    show?: boolean;
  }>(),
  {
    show: true,
  }
);
</script>

<template>
  <div v-if="show" class="loading-label">
    <dollar-icon />
    <div class="loading-label__content">
      <slot><span>Please wait...</span></slot>
    </div>
  </div>
  <template v-else>
    <slot />
  </template>
</template>

<style>
.loading-label,
.loading-label__content {
  display: inline;
}

.loading-label__content {
  padding-left: 1ch;
}
</style>
