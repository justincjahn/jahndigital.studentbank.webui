<template>
  <p>Admin Home</p>

  <ul>
    <li v-for="instance in InstanceState.instances" :key="instance.id">
      {{ instance.description }}
    </li>
  </ul>
</template>

<script>
import InstanceState from '@/store/modules/instance';
import InstanceService from '@/services/InstanceService';
import Apollo from '@/services/Apollo';

const instanceService = new InstanceService(Apollo);

export default {
  setup() {
    if (InstanceState.instances.length === 0) {
      instanceService.getInstances();
    }

    return {
      InstanceState,
    };
  },
};
</script>
