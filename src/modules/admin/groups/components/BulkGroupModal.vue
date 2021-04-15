<template>
  <modal
    title="Bulk Move"
    cancel-label="Cancel"
    :show="show"
    :can-submit="canSubmit"
    :ok-label="okLabel"
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
        <loading-icon>{{ okLabel }}</loading-icon>
      </template>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';

// Components
import Modal from '@/components/Modal.vue';
import GroupSelector from '@/modules/admin/components/GroupSelector.vue';
import LoadingIcon from '@/components/LoadingIcon.vue';
import { GroupStore } from '@/store/group';

export default defineComponent({
  components: {
    Modal,
    GroupSelector,
    LoadingIcon,
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
      emit('cancel');
    }

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
