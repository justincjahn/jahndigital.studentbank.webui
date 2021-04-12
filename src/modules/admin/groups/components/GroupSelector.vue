<template>
  <group-selector v-model="selectedGroup" />
</template>

<script lang="ts">
import GroupSelector from '@/modules/admin/components/GroupSelector.vue';
import groupStore from '@/store/group';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  components: {
    GroupSelector,
  },
  setup() {
    const selectedGroup = computed<Group|null>({
      get: () => groupStore.selected.value,
      set: (item) => groupStore.setSelected(item),
    });

    return { selectedGroup };
  },
});
</script>
