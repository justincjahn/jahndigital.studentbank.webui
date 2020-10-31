<template>
  <div class="side-panel">
    <InstanceSelector />

    <div class="group-selector" v-if="InstanceState.selectedInstance">
      <GroupSelector />
    </div>
    <div v-else>
      <p>Please select an instance...</p>
    </div>
  </div>
  <div class="main-panel">
    <StudentList />
  </div>
</template>

<script lang="ts">
import StudentList from '@/components/StudentList.vue';
import InstanceSelector from '@/components/InstanceSelector.vue';
import GroupSelector from '@/components/GroupSelector.vue';

import InstanceState from '@/store/modules/instance';

export default {
  components: {
    StudentList,
    InstanceSelector,
    GroupSelector,
  },
  setup() { return { InstanceState }; },
};
</script>

<style lang="scss">
  .group-selector {
    margin: 0.5em 0;
  }
</style>
