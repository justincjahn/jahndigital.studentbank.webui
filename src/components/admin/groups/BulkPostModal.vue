<template>
  <modal
    :show="show"
    cancelLabel="Cancel"
    okLabel="Post"
    @ok="handleOk"
    @cancel="handleCancel"
    title="Bulk Transaction"
    customClass="bulk-post-modal"
  >
    <template #default>
      <p>
        You have {{selection.getStudents().length}}
        {{selection.getStudents().length == 1 ? 'student' : 'students'}} selected,

        {{selection.getGroups().length}}
        {{selection.getGroups().length == 1 ? 'group' : 'groups'}} selected, and

        {{selection.getExcludedStudents().length}}
        {{selection.getExcludedStudents().length == 1 ? 'exclusion' : 'exclusions'}}.

        <template v-if="loading">Please wait...</template>
        <strong v-else-if="students.length <= 0" class="error">Please select some students to begin!</strong>
        <template v-else>
          This transaction will post to a total of {{students.length}}
          {{students.length > 1 ? 'students' : 'student'}}.
        </template>
      </p>
    </template>
    <template #buttons="{ okLabel, handleOk, cancelLabel, handleCancel }">
      <button @click.prevent="handleCancel">{{cancelLabel}}</button>
      <button class="primary" :disabled="!isValid || loading" @click.prevent="handleOk">{{okLabel}}</button>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, computed } from 'vue';
import selection from '@/services/StudentSelectionService';
import Modal from '@/components/Modal.vue';

export default defineComponent({
  components: {
    Modal,
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
    const loading = ref(false);
    const students = ref<Student[]>([]);

    const isValid = computed(() => {
      if (loading.value) return false;
      if (students.value.length === 0) return false;
      return true;
    });

    /**
     * Fired when the user clicks 'OK', or hits Enter.
     */
    function handleOk() {
      // Only allow the posting logic to run if there is a valid state.
      if (!isValid.value) return;
      emit('ok');
    }

    /**
     * Fired when the user clicks 'Cancel', or hits Esc.
     */
    function handleCancel() {
      emit('cancel');
    }

    watchEffect(async () => {
      if (props.show) {
        loading.value = true;
        students.value = await selection.resolve();
        loading.value = false;
      }
    });

    return {
      handleOk,
      handleCancel,
      isValid,
      selection,
      students,
      loading,
    };
  },
});
</script>

<style lang="scss">
.bulk-post-modal {
  p + p {
    margin-top: 1em;
  }
}
</style>
