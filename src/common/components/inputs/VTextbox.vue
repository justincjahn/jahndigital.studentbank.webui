<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import useUniqueId from '@/common/composables/useUniqueId';
import type { ValidationFunc } from './types';
import VInput from './VInput.vue';

const props = withDefaults(
  defineProps<{
    name: string;
    id?: string;
    modelValue?: string | boolean;
    helpText?: string;
    error?: string;
    label?: string;
    required?: boolean;
    validator?: ValidationFunc;
    maxLines?: number;
  }>(),
  {
    id: `input-${useUniqueId().toString()}`,
    modelValue: '',
    helpText: '',
    error: '',
    label: '',
    required: false,
    validator: () => false,
    maxLines: 10,
  }
);

defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'update:error', error: string | false): void;
}>();

const textarea = ref<HTMLTextAreaElement | null>(null);

const attrs = useAttrs();

function handleInput(value: string, callback: (value: string) => void) {
  if (textarea.value instanceof HTMLTextAreaElement) {
    const maxLineBreaks = props.maxLines;
    const numLineBreaks = (value.match(/\n/g) || []).length + 1;
    textarea.value.rows = Math.min(numLineBreaks, Number(maxLineBreaks));
  }

  callback(value);
}
</script>

<template>
  <v-input
    v-bind="{ ...props, ...attrs }"
    @update:model-value="(value: string | boolean) => $emit('update:modelValue', value)"
    @update:error="(value: string | false) => $emit('update:error', value)"
  >
    <template v-for="slotName in Object.keys($slots)" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>

    <template
      #default="{
        id: inputId,
        modelValue: val,
        classes,
        update,
        inputName,
        required: isReq,
        attrs: inputAttrs,
      }"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <textarea
        :id="inputId"
        ref="textarea"
        :name="inputName"
        :value="val.toString()"
        :class="classes"
        :required="isReq"
        v-bind="inputAttrs"
        @input="
          handleInput(($event?.target as HTMLTextAreaElement).value, update)
        "
        @focus="($event?.target as HTMLTextAreaElement).select()"
      />
    </template>
  </v-input>
</template>

<style scoped>
textarea {
  padding: 0.5em;
  min-height: 75px;
  resize: none;
}
</style>
