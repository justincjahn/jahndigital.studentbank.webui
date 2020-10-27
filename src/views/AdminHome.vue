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
      <GroupList />
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
import Instance from '@/@types/Instance';
import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';
import StudentState from '@/store/modules/student';
import Select from '@/components/Select.vue';
import GroupList from '@/components/GroupList.vue';
import StudentList from '@/components/StudentList.vue';
import { ref, watchEffect } from 'vue';

export default {
  components: {
    Select,
    GroupList,
    StudentList,
  },
  setup() {
    const isModalOpen = ref(false);

    if (InstanceState.instances.length === 0) {
      InstanceState.fetchInstances();
    }

    watchEffect(() => {
      if (InstanceState.instances.length > 0 && InstanceState.selectedInstance === null) {
        const selected = InstanceState.instances.find((x) => x.isActive);
        if (selected) InstanceState.setSelectedInstance(selected);
      }
    });

    function selectInstance(item: Instance) {
      if (InstanceState.selectedInstance) {
        if (InstanceState.selectedInstance.id !== item.id) {
          GroupState.setSelectedGroup(null);
        }
      }

      InstanceState.setSelectedInstance(item);
    }

    return {
      InstanceState,
      StudentState,
      GroupState,
      selectInstance,
      isModalOpen,
    };
  },
};
</script>
