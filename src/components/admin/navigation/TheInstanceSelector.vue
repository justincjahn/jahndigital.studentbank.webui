<template>
  <instance-selector v-model="selectedInstance" />
</template>

<script lang="ts">
import instanceStore from '@/store/instance';
import InstanceSelector from '@/components/InstanceSelector.vue';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  components: {
    InstanceSelector,
  },
  setup() {
    const selectedInstance = computed<Instance|null>({
      get: () => instanceStore.selected.value,
      set: (item) => instanceStore.setSelected(item),
    });

    return { selectedInstance };
  },
});
</script>
