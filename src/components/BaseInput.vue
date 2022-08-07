<script lang="ts">
import { validationFunc } from '@/types';
import { computed, watchEffect } from 'vue';
import uuid4 from '@/utils/uuid4';

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  id?: string
  name?: string
  modelValue?: string|boolean
  helpText?: string
  error?: string
  label?: string
  required?: boolean
  validator?: validationFunc
}>(), {
  modelValue: '',
  helpText: '',
  error: '',
  label: '',
  required: false,
  validator: (): boolean => false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string|boolean): void
  (event: 'update:error', error: string|false): void
}>();

const inputId = computed(() => {
  if (props.id) return props.id;
  return uuid4();
});

function handleUpdate(value: string|boolean) {
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
  <div class="fieldset" :class="[$attrs.class ?? '', required ? 'required' : '']">
    <slot
      :id="inputId"
      :inputName="name"
      name="label"
      className="help-text"
      :model-value="modelValue"
      :error="error"
      :label="label"
      :help-text="helpText"
      :update="handleUpdate"
      :attrs="$attrs"
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
      name="help"
      className="help-text"
      :model-value="modelValue"
      :error="error"
      :label="label"
      :required="required"
      :help-text="helpText"
      :update="handleUpdate"
      :attrs="$attrs"
    >
      <p v-if="helpText" class="help-text">
        {{ helpText }}
      </p>
    </slot>

    <slot
      :id="inputId"
      :inputName="name"
      :modelValue="modelValue"
      :error="error"
      :label="label"
      :required="required"
      :helpText="helpText"
      :update="handleUpdate"
      :attrs="$attrs"
    >
      <input
        :id="inputId"
        type="text"
        :name="name"
        :value="modelValue"
        :class="{ error, required }"
        :required="required"
        v-bind="$attrs"
        @input="handleUpdate(($event?.target as HTMLInputElement)?.value)"
        @focus="($event?.target as HTMLInputElement)?.select()"
      />
    </slot>

    <p v-if="error" class="error">
      <slot
        :id="inputId"
        name="error"
        :inputName="name"
        :model-value="modelValue"
        :error="error"
        :label="label"
        :help-text="helpText"
        :update="handleUpdate"
        :attrs="$attrs"
      >
        {{ error }}
      </slot>
    </p>
  </div>
</template>
