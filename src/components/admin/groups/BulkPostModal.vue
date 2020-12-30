<template>
  <modal
    :show="show"
    cancelLabel="Cancel"
    okLabel="Post"
    @ok="handleOk"
    @cancel="handleCancel"
    title="Bulk Transaction"
  >
    <template #default>
      <p>
        You have {{selection.getStudents().length}} student(s) selected,
        {{selection.getGroups().length}} group(s) selected, and
        {{selection.getExcludedStudents().length}} exclusion(s).
      </p>

      <p v-if="loading">Please wait...</p>
      <p v-else>This transaction will post to a total of {{students.length}} students.</p>
    </template>
    <template #buttons="{ okLabel, handleOk, cancelLabel, handleCancel }">
      <button @click.prevent="handleCancel">{{cancelLabel}}</button>
      <button class="primary" :disabled="!isValid || loading" @click.prevent="handleOk">{{okLabel}}</button>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
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
    const isValid = ref(false);
    const loading = ref(false);
    const students = ref<Student[]>([]);

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
        isValid.value = true;
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

</style>
