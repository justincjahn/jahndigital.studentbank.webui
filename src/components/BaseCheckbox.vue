<template>
  <base-input
    v-bind="$props"
    class="inline"
    @update:modelValue="value => $emit('update:modelValue', value)"
    @update:error="value => $emit('update:error', value)"
  >
    <template #default="{ id: inputId, modelValue: val, update, inputName }">
      <input
        :id="inputId"
        :name="inputName"
        :checked="val"
        type="checkbox"
        v-bind="$attrs"
        @input="update($event.target.checked)"
      />
    </template>
  </base-input>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BaseInput, { validationFunc } from './BaseInput.vue';

export default defineComponent({
  components: {
    BaseInput,
  },
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
    modelValue: {
      type: [String, Boolean],
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
      default: () => true,
    },
  },
  emits: [
    'update:modelValue',
    'update:error',
  ],
});
</script>
