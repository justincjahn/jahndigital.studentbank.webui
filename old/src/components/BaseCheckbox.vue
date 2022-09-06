<script setup lang="ts">
import { validationFunc } from '@/types';
import BaseInput from './BaseInput.vue';

withDefaults(defineProps<{
  id?: string
  name?: string
  modelValue?: string|boolean
  helpText?: string
  error?: string
  label?: string
  required?: boolean
  validator?: validationFunc
}>(), {
  modelValue: '',
  helpText: '',
  error: '',
  label: '',
  required: false,
  validator: (): boolean => false,
});

defineEmits<{
  (event: 'update:modelValue', value: string|boolean): void
  (event: 'update:error', error: string|false): void
}>();
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<template>
  <base-input
    v-bind="$props"
    class="inline"
    @update:modelValue="value => $emit('update:modelValue', value)"
    @update:error="value => $emit('update:error', value)"
  >
    <template #default="{ id: inputId, modelValue: val, update, inputName, required: isReq }">
      <input
        :id="inputId"
        :name="inputName"
        :checked="(val as boolean)"
        :required="isReq"
        type="checkbox"
        v-bind="$attrs"
        @input="update(($event?.target as HTMLInputElement)?.checked)"
      />
    </template>
  </base-input>
</template>
