<script setup lang="ts">
import { validationFunc } from '@/types';
import { PropType, ref } from 'vue';
import BaseInput from './BaseInput.vue';

defineProps({
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
  required: {
    type: Boolean,
    default: false,
  },
  validator: {
    type: Function as PropType<validationFunc>,
    default: undefined,
  },
});

defineEmits([
  'update:modelValue',
  'update:error',
]);

const textarea = ref<HTMLTextAreaElement|null>(null);

function handleInput(value: string, callback: (value: string) => void) {
  if (textarea.value instanceof HTMLTextAreaElement) {
    const maxLineBreaks = textarea.value.getAttribute('data-max-lines') || 10;
    const numLineBreaks = (value.match(/\n/g) || []).length + 1;
    textarea.value.rows = Math.min(numLineBreaks, Number(maxLineBreaks));
  }

  callback(value);
}
</script>

<template>
  <base-input
    v-bind="$props"
    @update:modelValue="value => $emit('update:modelValue', value)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>

    <template #default="{ id: inputId, modelValue: val, update, error: err, inputName, required: isReq }">
      <textarea
        ref="textarea"
        :id="inputId"
        :name="inputName"
        :value="val?.toString() ?? ''"
        :class="{ err, isReq }"
        :required="isReq"
        v-bind="$attrs"
        @input="handleInput(($event?.target as HTMLTextAreaElement).value, update)"
        @focus="($event?.target as HTMLTextAreaElement).select()"
      />
    </template>
  </base-input>
</template>

<style scoped>
  textarea {
    padding: 0.5em;
    min-height: 75px;
    resize: none;
  }
</style>
