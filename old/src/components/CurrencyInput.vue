<template>
  <base-input
    v-bind="$props"
    @update:modelValue="value => $emit('update:modelValue', value)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>

    <template #default="{ id: inputId, modelValue: val, update, error: err, inputName, required: isReq }">
      <base-currency-input
        :id="inputId"
        :name="inputName"
        :model-value="val.toString()"
        :error="err"
        :validator="validator"
        :allow-negative="allowNegative"
        :allow-zero="allowZero"
        :required="isReq"
        v-bind="$attrs"
        @update:modelValue="x => update(x)"
        @update:error="x => $emit('update:error', x)"
      />
    </template>
  </base-input>
</template>

<script setup lang="ts">
import { validationFunc } from '@/types';
import BaseInput from './BaseInput.vue';
import BaseCurrencyInput from './BaseCurrencyInput.vue';

withDefaults(defineProps<{
  id?: string
  name?: string
  modelValue?: string
  helpText?: string
  error?: string
  label?: string
  required?: boolean
  validator?: validationFunc
  allowNegative?: boolean
  allowZero?: boolean
}>(), {
  modelValue: '',
  helpText: '',
  error: '',
  label: '',
  required: false,
  allowNegative: true,
  allowZero: true,
  validator: (): boolean => false,
});

defineEmits<{
  (event: 'update:modelValue', value: string|boolean): void
  (event: 'update:error', error: string|false): void
}>();
</script>
