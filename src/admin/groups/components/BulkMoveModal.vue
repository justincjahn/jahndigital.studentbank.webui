<script lang="ts" setup>
import { ref, defineAsyncComponent, computed, watchEffect } from 'vue';

import type { Group } from '@/admin/common/services/group';

// Utils
import { GLOBAL_STORE } from '@/admin/symbols';
import injectStrict from '@/common/utils/injectStrict';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const GroupSelector = defineAsyncComponent(
  () => import('@/admin/common/components/GroupSelector.vue')
);

const props = defineProps<{
  show: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  (event: 'ok', group: Group): void;
  (event: 'cancel'): void;
}>();

const globalStore = injectStrict(GLOBAL_STORE);

const newGroup = ref<Group | null>(null);

const modalOkLabel = computed(() => (props.loading ? 'Loading...' : 'Move'));

const canSubmit = computed(() => {
  if (newGroup.value === null) return false;
  if (props.loading) return false;
  return true;
});

function handleOk() {
  if (!canSubmit.value) return;
  if (newGroup.value === null) return;
  emit('ok', newGroup.value);
}

function handleCancel() {
  if (props.loading) return;
  emit('cancel');
}

watchEffect(() => {
  if (props.show === true) {
    newGroup.value = null;
  }
});
</script>

<template>
  <modal-dialog
    title="Move Students"
    :show="props.show"
    :ok-label="modalOkLabel"
    cancel-label="Cancel"
    :can-submit="canSubmit"
    :can-cancel="props.loading === false"
    :handle-enter="canSubmit"
    :handle-escape="props.loading === false"
    @submit="handleOk"
    @cancel="handleCancel"
  >
    <template #okLabel="{ okLabel }">
      <loading-label :show="props.loading">
        {{ okLabel }}
      </loading-label>
    </template>

    <group-selector v-model="newGroup" :store="globalStore" label="New Group" />
  </modal-dialog>
</template>
