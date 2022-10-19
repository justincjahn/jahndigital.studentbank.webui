<script lang="ts">
import { computed, ref, useAttrs } from 'vue';
import useUniqueId from '@/common/composables/useUniqueId';
import type { ValidationFunc } from './types';

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    modelValue?: string | boolean;
    helpText?: string;
    error?: string;
    label?: string;
    required?: boolean;
    validator?: ValidationFunc;
  }>(),
  {
    id: undefined,
    name: undefined,
    modelValue: undefined,
    helpText: undefined,
    error: undefined,
    label: undefined,
    required: false,
    validator: undefined,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | boolean): void;
  (event: 'update:error', error: string): void;
}>();

const attrs = useAttrs();

const inputId = computed(() => props.id ?? `input-${useUniqueId()}`);

const inputName = computed(() => props.name ?? inputId.value);

const internalModelValue = ref<string | boolean>('');

const input = computed({
  get() {
    return typeof props.modelValue !== 'undefined'
      ? props.modelValue
      : internalModelValue.value;
  },

  set(value) {
    if (typeof props.modelValue !== 'undefined') {
      emit('update:modelValue', value);
    } else {
      internalModelValue.value = value;
    }
  },
});

const internalError = ref('');

const error = computed({
  get() {
    return typeof props.error !== 'undefined'
      ? props.error
      : internalError.value;
  },

  set(value) {
    if (typeof props.error !== 'undefined') {
      emit('update:error', value);
    } else {
      internalError.value = value;
    }
  },
});

const hasErrors = computed(() => error.value.length > 0);

const inputClasses = computed(() => ({
  error: hasErrors.value,
  required: props.required,
}));

const inputAttrs = computed(() => ({
  'aria-labelledby': (props.label?.length ?? 0) > 0 ? inputId.value : undefined,
  'aria-label': (props.label?.length ?? 0) > 0 ? undefined : props.name,
  ...attrs,
}));

async function handleUpdate(e: Event, v?: (e: Event) => string | boolean) {
  if (!e.target) return;
  const el = e.target as HTMLInputElement;
  const value = typeof v === 'function' ? v(e) : el.value;

  input.value = value;

  if (props.validator) {
    const validationError = await Promise.resolve(
      props.validator(value.toString())
    );

    if (validationError === true) {
      el.setCustomValidity('');
    } else if (validationError === false) {
      el.setCustomValidity('An unknown error occurred.');
    } else {
      el.setCustomValidity(validationError);
    }
  }

  error.value = el.validationMessage;
}
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
      :error="error"
      :help-text="helpText"
      :input-name="inputName"
      :label="label"
      :model-value="input"
      :required="required"
      :has-errors="hasErrors"
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
      :classes="['help-text']"
      :error="error"
      :help-text="helpText"
      :input-name="inputName"
      :label="label"
      :model-value="input"
      :required="required"
      :has-errors="hasErrors"
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
      :error="error"
      :help-text="helpText"
      :input-name="inputName"
      :label="label"
      :model-value="input"
      :required="required"
      :has-errors="hasErrors"
      :update="handleUpdate"
    >
      <!-- @NOTE Order is important -->
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <input
        :id="inputId"
        ref="inputElement"
        :name="inputName"
        :value="input"
        :class="inputClasses"
        :required="required"
        type="text"
        v-bind="inputAttrs"
        @input="handleUpdate"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </slot>

    <slot
      :id="inputId"
      :attrs="inputAttrs"
      :classes="inputClasses"
      :error="error"
      :help-text="helpText"
      :input-name="inputName"
      :label="label"
      :model-value="input"
      :required="required"
      :has-errors="hasErrors"
      :update="handleUpdate"
      name="error"
    >
      <p class="error">
        {{ error }}
      </p>
    </slot>
  </div>
</template>
