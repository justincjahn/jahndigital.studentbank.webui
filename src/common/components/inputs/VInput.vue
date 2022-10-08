<script lang="ts">
import { computed, watchEffect, useAttrs } from 'vue';
import useUniqueId from '@/common/composables/useUniqueId';
import type { ValidationFunc } from './types';

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
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
  }>(),
  {
    id: undefined,
    modelValue: '',
    helpText: '',
    error: '',
    label: '',
    required: false,
    validator: () => false,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | boolean): void;
  (event: 'update:error', error: string | false): void;
}>();

const attrs = useAttrs();

const inputId = computed(() => props.id ?? `input-${useUniqueId()}`);

const inputClasses = computed(() => ({
  error: props.error.length > 0,
  required: props.required,
}));

const inputAttrs = computed(() => ({
  'aria-labelledby': props.label.length > 0 ? inputId.value : undefined,
  'aria-label': props.label.length > 0 ? undefined : props.name,
  ...attrs,
}));

function handleUpdate(value: string | boolean) {
  emit('update:modelValue', value);
}

watchEffect(async () => {
  const { modelValue, validator } = props;
  if (!validator) return;

  const error = await Promise.resolve(validator(modelValue.toString()));
  emit('update:error', error === true ? '' : error);
});
</script>

<template>
  <div
    class="fieldset"
    :class="[$attrs.class ?? '', required ? 'required' : '']"
  >
    <slot
      :id="inputId"
      :attrs="inputAttrs"
      :classes="{}"
      :error="props.error"
      :help-text="helpText"
      :input-name="name"
      :label="label"
      :model-value="modelValue"
      :required="required"
      :has-errors="props.error.length > 0"
      :update="handleUpdate"
      name="label"
    >
      <label v-if="label" :for="inputId">
        <template v-if="required">
          {{ label }}<span class="required">*</span>
        </template>
        <template v-else>
          {{ label }}
        </template>
      </label>
    </slot>

    <slot
      :id="inputId"
      :attrs="inputAttrs"
      :classes="{ 'help-text': true }"
      :error="props.error"
      :help-text="helpText"
      :input-name="name"
      :label="label"
      :model-value="modelValue"
      :required="required"
      :has-errors="props.error.length > 0"
      :update="handleUpdate"
      name="help"
    >
      <p v-if="helpText" class="help-text">
        {{ helpText }}
      </p>
    </slot>

    <slot
      :id="inputId"
      :attrs="inputAttrs"
      :classes="inputClasses"
      :error="props.error"
      :help-text="helpText"
      :input-name="name"
      :label="label"
      :model-value="modelValue"
      :required="required"
      :has-errors="props.error.length > 0"
      :update="handleUpdate"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <input
        :id="inputId"
        type="text"
        :name="name"
        :value="modelValue"
        :class="inputClasses"
        :required="required"
        v-bind="inputAttrs"
        @input="handleUpdate(($event?.target as HTMLInputElement)?.value)"
        @focus="($event?.target as HTMLInputElement)?.select()"
      />
    </slot>

    <slot
      :id="inputId"
      :attrs="inputAttrs"
      :classes="inputClasses"
      :error="props.error"
      :help-text="helpText"
      :input-name="name"
      :label="label"
      :model-value="modelValue"
      :required="required"
      :has-errors="props.error.length > 0"
      :update="handleUpdate"
      name="error"
    >
      <p v-if="error" class="error">
        {{ error }}
      </p>
    </slot>
  </div>
</template>
