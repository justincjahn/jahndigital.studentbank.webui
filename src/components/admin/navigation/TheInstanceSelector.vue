<template>
  <instance-selector v-model="selectedInstance" />
</template>

<script lang="ts">
import instanceStore from '@/store/instance';
import InstanceSelector from '@/components/InstanceSelector.vue';
import { defineComponent, computed, watchEffect } from 'vue';

export enum ModalState {
  ADD,
  EDIT,
  DELETE,
}

export default defineComponent({
  components: {
    InstanceSelector,
  },
  setup() {
    const selectedInstance = computed<Instance|null>({
      get: () => instanceStore.selected.value,
      set: (item) => instanceStore.setSelected(item),
    });

    // If there is no selected instance, try to select the active one.
    watchEffect(() => {
      if (instanceStore.instances.value.length > 0 && instanceStore.selected.value === null) {
        const selected = instanceStore.instances.value.find((x) => x.isActive);
        if (selected) instanceStore.setSelected(selected);
      }
    });

    return { selectedInstance };
  },
});
</script>
