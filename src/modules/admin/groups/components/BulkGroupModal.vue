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
      <group-selector v-model="selectedGroup" />
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
import { defineComponent, ref, computed, watchEffect } from 'vue';
import Modal from '@/components/Modal.vue';
import GroupSelector from '@/modules/admin/components/GroupSelector.vue';
import errorStore from '@/store/error';
import StudentSelectionService from '@/services/StudentSelectionService';
import LoadingIcon from '@/components/LoadingIcon.vue';
import Apollo from '@/services/Apollo';
import gqlBulkGroup from '@/graphql/updateBulkStudent.mutation.gql';

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
  },
  emits: [
    'ok',
    'cancel',
  ],
  setup(props, { emit }) {
    const selectedGroup = ref<Group|null>(null);
    const selectedStudents = ref<Student[]>([]);
    const loading = ref(false);
    const posting = ref(false);
    const okLabel = computed(() => (loading.value ? 'Loading...' : 'Move'));

    const canSubmit = computed(() => {
      if (selectedGroup.value === null) return false;
      if (selectedStudents.value.length === 0) return false;
      if (loading.value === true) return false;
      return true;
    });

    async function handleOk() {
      if (!canSubmit.value) return;
      if (selectedGroup.value == null) return;

      const students: UpdateStudentRequest[] = [];
      selectedStudents.value.forEach((student) => {
        students.push({
          id: student.id,
          groupId: selectedGroup.value?.id ?? student.groupId,
        });
      });

      try {
        posting.value = true;
        const res = await Apollo.mutate<UpdateBulkStudentResponse>({
          mutation: gqlBulkGroup,
          variables: {
            students,
          },
          update(cache) {
            cache.evict({ fieldName: 'students' });
          },
        });

        if (!res.data) throw new Error('Unable post transaction: unknown error.');
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        posting.value = false;
      }

      emit('ok', selectedGroup.value);
    }

    function handleCancel() {
      emit('cancel');
    }

    watchEffect(async () => {
      if (props.show === true) {
        try {
          loading.value = true;
          selectedGroup.value = null;
          selectedStudents.value = await StudentSelectionService.resolve();
        } catch (e) {
          errorStore.setCurrentError(e?.message ?? e);
        } finally {
          loading.value = false;
        }
      }
    });

    return {
      okLabel,
      handleOk,
      handleCancel,
      selectedGroup,
      canSubmit,
      loading,
    };
  },
});
</script>
