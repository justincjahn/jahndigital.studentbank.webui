<script lang="ts" setup>
import DollarIcon from '@/common/components/DollarIcon.vue';

withDefaults(
  defineProps<{
    overlay?: boolean;
  }>(),
  {
    overlay: false,
  }
);
</script>

<template>
  <template v-if="overlay">
    <teleport to="#modal">
      <div class="loading-overlay">
        <div class="loading-overlay__container">
          <dollar-icon class="loading-overlay__container__icon" />
          <p>Loading...</p>
        </div>
      </div>
    </teleport>
  </template>
  <template v-else>
    <div class="loading-inline">
      <div class="loading-overlay__container">
        <dollar-icon class="loading-overlay__container__icon" />
        <p>Loading...</p>
      </div>
    </div>
  </template>
</template>

<style>
.loading-overlay,
.loading-inline {
  overflow: hidden;
  pointer-events: none;
  text-align: center;
  font-size: 4rem;
}

.loading-overlay {
  position: absolute;
  z-index: 500; /* Important: don't set larger than the lowest modal at 900. */
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: hsl(var(--clr-neutral-100));
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-overlay .loading-overlay__container__icon {
  font-size: 3em;
}

.loading-inline .loading-overlay__container__icon {
  font-size: 2em;
}
</style>
