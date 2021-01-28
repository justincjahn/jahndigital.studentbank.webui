<template>
  <instance-selector v-model="selectedInstance" @update:modelValue="update" />
</template>

<script lang="ts">
import instanceStore from '@/store/instance';
import InstanceSelector from '@/components/InstanceSelector.vue';
import { defineComponent, ref, watchEffect } from 'vue';

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
    // The selected instance
    const selectedInstance = ref<Instance|null>(null);

    // If there is no selected instance, try to select the active one.
    watchEffect(() => {
      if (instanceStore.instances.value.length > 0 && instanceStore.selected.value === null) {
        const selected = instanceStore.instances.value.find((x) => x.isActive);
        if (selected) instanceStore.setSelected(selected);
      }
    });

    // When the state changes, set the selected instance
    watchEffect(() => { selectedInstance.value = instanceStore.selected.value; });

    // Update the state when a new instance is selected
    function update(item: Instance) { instanceStore.setSelected(item); }

    return {
      selectedInstance,
      update,
    };
  },
});
</script>
