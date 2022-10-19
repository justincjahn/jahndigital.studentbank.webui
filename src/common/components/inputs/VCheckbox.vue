<script lang="ts">
import { useAttrs } from 'vue';
import type { ValidationFunc } from './types';
import VInput from './VInput.vue';

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const props = defineProps<{
  name?: string;
  id?: string;
  modelValue?: string | boolean;
  helpText?: string;
  error?: string;
  label?: string;
  required?: boolean;
  validator?: ValidationFunc;
}>();

defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'update:error', error: string | false): void;
}>();

const attrs = useAttrs();
</script>

<template>
  <v-input
    v-bind="{ ...props, ...attrs }"
    :class="attrs.class ?? 'inline'"
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
        update,
        inputName,
        required: isReq,
        attrs: inputAttrs,
      }"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <input
        :id="inputId"
        :name="inputName"
        :checked="(val as boolean)"
        :required="isReq"
        type="checkbox"
        v-bind="inputAttrs"
        @input="
          update($event, () => ($event.target as HTMLInputElement).checked)
        "
      />
    </template>
  </v-input>
</template>
