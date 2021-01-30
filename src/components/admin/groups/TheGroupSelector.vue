<template>
  <group-selector v-model="selectedGroup" @update:modelValue="update" />
</template>

<script lang="ts">
import GroupSelector from '@/components/GroupSelector.vue';
import groupStore from '@/store/group';
import { defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  components: {
    GroupSelector,
  },
  setup() {
    const selectedGroup = ref<Group|null>(null);

    watchEffect(() => { selectedGroup.value = groupStore.selected.value; });

    function update(item: Group|null) { groupStore.setSelected(item); }

    return {
      selectedGroup,
      update,
    };
  },
});
</script>
