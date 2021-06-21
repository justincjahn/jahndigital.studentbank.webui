<template>
  <base-input
    v-bind="$props"
    @update:modelValue="value => $emit('update:modelValue', value)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>

    <template #default="{ id: inputId, modelValue: val, update, error: err, inputName }">
      <base-currency-input
        :id="inputId"
        :name="inputName"
        :model-value="val"
        :error="err"
        :validator="validator"
        :allow-negative="allowNegative"
        :allow-zero="allowZero"
        v-bind="$attrs"
        @update:modelValue="x => update(x)"
        @update:error="x => $emit('update:error', x)"
      />
    </template>
  </base-input>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BaseInput, { validationFunc } from './BaseInput.vue';
import BaseCurrencyInput from './BaseCurrencyInput.vue';

export default defineComponent({
  components: {
    BaseInput,
    BaseCurrencyInput,
  },
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default: undefined,
    },
    modelValue: {
      type: String,
      default: '',
    },
    helpText: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    validator: {
      type: Function as PropType<validationFunc>,
      default: undefined,
    },
    allowNegative: {
      type: Boolean,
      default: true,
    },
    allowZero: {
      type: Boolean,
      default: true,
    },
  },
  emits: [
    'update:modelValue',
    'update:error',
  ],
});
</script>
