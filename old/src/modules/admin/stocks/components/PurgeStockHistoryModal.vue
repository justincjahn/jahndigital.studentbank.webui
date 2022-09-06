<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { validateDate } from '@/utils/validators';
import Modal from '@/components/Modal.vue';
import BaseInput from '@/components/BaseInput.vue';

const props = defineProps<{
  show: boolean
  loading: boolean
}>();

const emit = defineEmits<{
  (e: 'ok', date: string): void
  (e: 'cancel'): void
}>();

const showConfirm = ref(false);
const date = ref('');
const dateError = ref('');

const canSubmit = computed(() => {
  if (props.loading) return false;
  if (dateError.value) return false;
  return true;
});

function handleOk() {
  showConfirm.value = true;
}

function handleConfirmOk() {
  showConfirm.value = false;
  emit('ok', date.value);
}

function handleCancel() {
  showConfirm.value = false;
  emit('cancel');
}

function reset() {
  date.value = '';
  dateError.value = '';
}

watchEffect(() => {
  if (props.show) {
    reset();
  }
});
</script>

<template>
  <modal
    :show="show"
    title="Purge Stocks"
    class="destructive"
    ok-label="Purge"
    cancel-label="Cancel"
    :can-submit="canSubmit"
    :handle-enter="canSubmit"
    :can-cancel="!loading"
    :handle-escape="!loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <form @submit.prevent>
      <base-input
        type="date"
        v-model="date"
        v-model:error="dateError"
        required
        label="Purge Date"
        name="purge-date"
        :validator="validateDate"
      />
    </form>
  </modal>

  <modal
    :show="showConfirm"
    title="Are you sure?"
    class="destructive"
    ok-label="Purge"
    cancel-label="Cancel"
    @ok="handleConfirmOk"
    @cancel="handleCancel"
  >
    Are you sure you want to purge history?  This action cannot be undone.
  </modal>
</template>
