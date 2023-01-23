<script lang="ts" setup>
import { watchEffect, toRef, computed } from 'vue';
import { VInput } from '@/common/components/inputs';
import type { StudentDTO } from './useStudentForm';
import useStudentForm from './useStudentForm';

const props = defineProps<{
  modelValue: StudentDTO;
  instanceId: number;
  valid: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: StudentDTO): void;
  (event: 'update:valid', value: boolean): void;
  (event: 'update:loading', value: boolean): void;
}>();

const { data, errors, isValid, loading } = useStudentForm(
  toRef(props, 'instanceId'),
  props.modelValue
);

const valid = computed(() => isValid.value && !loading.value);

watchEffect(() => {
  emit('update:loading', loading.value);
});

watchEffect(() => {
  emit('update:valid', valid.value);
});
</script>

<template>
  <v-input
    v-model="data.accountNumber"
    v-model:error="errors.accountNumber"
    name="student-account-number"
    label="Account Number"
    required
  />

  <v-input
    v-model="data.firstName"
    v-model:error="errors.firstName"
    name="student-first-name"
    label="First Name"
    required
  />

  <v-input
    v-model="data.lastName"
    v-model:error="errors.lastName"
    name="student-last-name"
    label="Last Name"
    required
  />
</template>
