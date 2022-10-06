<script lang="ts" setup>
import { defineAsyncComponent, ref, computed } from 'vue';

// Types
import type { Group } from '@/admin/common/services/group';

// Services
import selection from '@/admin/groups/services/StudentSelectionService';

// Utils
import { GLOBAL_STORE } from '@/admin/symbols';
import injectStrict from '@/common/utils/injectStrict';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';

const GroupSelector = defineAsyncComponent(
  () => import('@/admin/common/components/GroupSelector.vue')
);

const StudentList = defineAsyncComponent(
  () => import('@/admin/groups/components/StudentList.vue')
);

const BulkMoveModal = defineAsyncComponent(
  () => import('@/admin/groups/components/BulkMoveModal.vue')
);

const BulkPostModal = defineAsyncComponent(
  () => import('@/admin/groups/components/BulkPostModal.vue')
);

enum ModalState {
  None,
  BulkMove,
  BulkPost,
}

const loading = ref(false);

const modalState = ref(ModalState.None);

const globalStore = injectStrict(GLOBAL_STORE);

const hasSelection = computed(() => selection.length > 0);

const selectedGroup = computed({
  get() {
    return globalStore.group.selected.value;
  },

  set(value) {
    globalStore.group.selected.value = value;
  },
});

function startBulkMove() {
  modalState.value = ModalState.BulkMove;
}

async function handleBulkMoveOk(group: Group) {
  loading.value = true;

  try {
    const students = await selection.resolve();
    await globalStore.student.bulkMove(group, students);
    modalState.value = ModalState.None;
    selectedGroup.value = group;
  } finally {
    loading.value = false;
  }
}

function handleBulkMoveCancel() {
  modalState.value = ModalState.None;
}

function startBulkPost() {
  modalState.value = ModalState.BulkPost;
}

function handleBulkPostOk() {
  modalState.value = ModalState.None;
}

function handleBulkPostCancel() {
  modalState.value = ModalState.None;
}
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
      <button
        type="button"
        :disabled="!hasSelection"
        @click="selection.clear()"
      >
        Clear Selection
      </button>

      <button type="button" :disabled="!hasSelection" @click="startBulkMove">
        Move Selected
      </button>
      <button type="button" :disabled="!hasSelection" @click="startBulkPost">
        New Transaction
      </button>
      <button type="button" :disabled="!hasSelection">New Share</button>
      <button type="button">New Student</button>
      <button type="button">Bulk Import</button>
    </div>
  </div>

  <div class="main-content">
    <suspense>
      <student-list class="student-list" />
    </suspense>
  </div>

  <suspense>
    <bulk-move-modal
      :show="modalState === ModalState.BulkMove"
      :loading="loading"
      @ok="handleBulkMoveOk"
      @cancel="handleBulkMoveCancel"
    />
  </suspense>

  <suspense>
    <bulk-post-modal
      :show="modalState === ModalState.BulkPost"
      @ok="handleBulkPostOk"
      @cancel="handleBulkPostCancel"
    />
  </suspense>
</template>

<style>
.student-list {
  /* Make pagination buttons always appear at the bottom. */

  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1em;
}
</style>
