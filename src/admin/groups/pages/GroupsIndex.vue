<script lang="ts" setup>
import { defineAsyncComponent, computed } from 'vue';
import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/admin/symbols';

import StudentList from '@/admin/groups/components/StudentList.vue';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';

const GroupSelector = defineAsyncComponent(
  () => import('@/admin/common/components/GroupSelector.vue')
);

// const StudentList = defineAsyncComponent(
//   () => import('@/admin/groups/components/StudentList.vue')
// );

const globalStore = injectStrict(GLOBAL_STORE);

const selectedGroup = computed({
  get() {
    return globalStore.group.selected.value;
  },

  set(value) {
    globalStore.group.selected.value = value;
  },
});
</script>

<template>
  <div class="sub-menu">
    <div>
      <suspense>
        <group-selector v-model="selectedGroup" :store="globalStore" />

        <template #fallback>
          <button type="button" disabled><loading-label /></button>
        </template>
      </suspense>
    </div>

    <div class="sub-menu__bulk-buttons">
      <button type="button" disabled>Clear Selection</button>
      <button type="button">Move Selected</button>
      <button type="button">New Transaction</button>
      <button type="button">New Share</button>
      <button type="button">New Student</button>
      <button type="button">Bulk Import</button>
    </div>
  </div>

  <suspense>
    <student-list :store="globalStore" />
  </suspense>
</template>
