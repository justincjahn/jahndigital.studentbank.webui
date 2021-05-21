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

<script lang="ts">
import { defineComponent } from 'vue';

import DollarIcon from './DollarIcon.vue';

export default defineComponent({
  components: {
    DollarIcon,
  },
  props: {
    show: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
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
