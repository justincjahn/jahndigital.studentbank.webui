<template>
  <div class="side-panel">
    <Select
      :options="InstanceState.instances"
      :key="(x) => x ? x.id : null"
      :value="(x) => x ? x.description : null"
      :default="InstanceState.selectedInstance"
      @select="selectInstance"
    />

    <div v-if="InstanceState.selectedInstance">
      <p>Groups...</p>
    </div>
    <div v-else>
      <p>Please select an instance...</p>
    </div>
  </div>
  <div class="main-panel">
    <p>Please select a group...</p>
  </div>
</template>

<script lang="ts">
import Instance from '@/@types/Instance';
import InstanceState from '@/store/modules/instance';
import InstanceService from '@/services/InstanceService';
import Apollo from '@/services/Apollo';
import Select from '@/components/Select.vue';
import { watchEffect } from 'vue';

const instanceService = new InstanceService(Apollo);

export default {
  components: {
    Select,
  },
  setup() {
    if (InstanceState.instances.length === 0) {
      instanceService.getInstances();
    }

    watchEffect(() => {
      if (InstanceState.instances.length > 0 && InstanceState.selectedInstance === null) {
        const selected = InstanceState.instances.find((x) => x.isActive);
        if (selected) InstanceState.setSelected(selected);
      }
    });

    function selectInstance(item: Instance) {
      InstanceState.setSelected(item);
    }

    return {
      InstanceState,
      selectInstance,
    };
  },
};
</script>
