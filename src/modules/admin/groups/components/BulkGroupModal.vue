<template>
  <modal
    title="Bulk Move"
    cancel-label="Cancel"
    :show="show"
    :can-submit="canSubmit"
    :ok-label="okLabel"
    :handle-enter="!loading"
    :handle-escape="!loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #default>
      <group-selector v-model="selectedGroup" :group-store="groupStore" />
    </template>
    <template #okLabel="{ okLabel, canSubmit }">
      <template v-if="canSubmit || !loading">
        {{ okLabel }}
      </template>
      <template v-else>
        <loading-label>{{ okLabel }}</loading-label>
      </template>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';

// Components
import Modal from '@/components/Modal.vue';
import GroupSelector from '@/modules/admin/components/GroupSelector.vue';
import LoadingLabel from '@/components/LoadingLabel.vue';

// Stores
import { GroupStore } from '../stores/group';

export default defineComponent({
  components: {
    Modal,
    GroupSelector,
    LoadingLabel,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    students: {
      type: Object as PropType<Student[]>,
      required: true,
    },
    groupStore: {
      type: Object as PropType<GroupStore>,
      required: true,
    },
  },
  emits: [
    'ok',
    'cancel',
  ],
  setup(props, { emit }) {
    const okLabel = computed(() => (props.loading === true ? 'Loading...' : 'Move'));

    // The group that is currently selected
    const selectedGroup = ref<Group|null>(null);

    // True if the state is valid for submission
    const canSubmit = computed(() => {
      if (selectedGroup.value === null) return false;
      if (props.students.length === 0) return false;
      if (props.loading === true) return false;
      return true;
    });

    /**
     * Ensure that the state is valid and emit the group to the parent.
     */
    async function handleOk() {
      if (!canSubmit.value) return;
      emit('ok', selectedGroup.value);
    }

    /**
     * Emit an event to close the modal.
     */
    function handleCancel() {
      if (props.loading) return;
      emit('cancel');
    }

    // When the modal opens, refresh the groups store
    watch(() => props.show, () => {
      if (props.show) {
        const instanceId = props.groupStore.instanceStore.selected.value?.id ?? -1;
        if (instanceId === -1) return;
        props.groupStore.fetchGroups(instanceId);
      }
    });

    return {
      okLabel,
      handleOk,
      handleCancel,
      selectedGroup,
      canSubmit,
    };
  },
});
</script>
