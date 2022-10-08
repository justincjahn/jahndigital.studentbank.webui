<script setup lang="ts">
import { ref, useAttrs, computed } from 'vue';
import type { ValidationFunc } from './types';
import VInput from './VInput.vue';

const props = defineProps<{
  name: string;
  id?: string;
  modelValue?: string | boolean;
  helpText?: string;
  error?: string;
  label?: string;
  required?: boolean;
  validator?: ValidationFunc;
}>();

defineEmits<{
  (event: 'update:modelValue', value: string | boolean): void;
  (event: 'update:error', error: string | false): void;
}>();

const attrs = useAttrs();

// Reference to the input to select it and copy the data
const input = ref<HTMLInputElement | null>(null);

// Set the input as readonly by default unless overridden
const inputProps = computed(() => ({
  ...props,
  readonly: attrs.readonly ?? true,
  ...attrs,
}));

// Copy the invite code to the clipboard
function handleCopy() {
  if (!input.value) return;
  input.value.select();
  input.value.setSelectionRange(0, input.value.value.length);
  document.execCommand('copy');
}
</script>

<template>
  <v-input
    v-bind="inputProps"
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
        attrs: inputAttrs,
      }"
    >
      <div class="copy-box">
        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <input
          :id="inputId"
          ref="input"
          :class="classes"
          :name="inputName"
          :value="val"
          v-bind="inputAttrs"
          type="text"
          @input="update(($event?.target as HTMLInputElement).value)"
          @focus="($event?.target as HTMLInputElement).select()"
        />

        <button type="button" class="secondary" @click="handleCopy">
          Copy
        </button>
      </div>
    </template>
  </v-input>
</template>

<style>
.copy-box {
  display: flex;
  flex-direction: row;
}

.copy-box input {
  flex-grow: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.copy-box button {
  margin: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
