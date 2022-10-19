<script setup lang="ts">
import { useAttrs } from 'vue';
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
    id: undefined,
    modelValue: undefined,
    helpText: undefined,
    error: undefined,
    label: undefined,
    required: undefined,
    validator: undefined,
    maxLines: 10,
  }
);

defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'update:error', error: string | false): void;
}>();

const attrs = useAttrs();

function handleInput(e: Event, callback: (e: Event) => void) {
  const el = e.target as HTMLTextAreaElement;
  const { value } = el;

  const maxLineBreaks = props.maxLines;
  const numLineBreaks = (value.match(/\n/g) || []).length + 1;
  el.rows = Math.min(numLineBreaks, Number(maxLineBreaks));

  callback(e);
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
        :name="inputName"
        :value="val.toString()"
        :class="classes"
        :required="isReq"
        v-bind="inputAttrs"
        @input="handleInput($event, update)"
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
