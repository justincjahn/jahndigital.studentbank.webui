<template>
  <div class="fieldset" :class="$attrs.class ?? ''">
    <slot
      :id="id"
      name="label"
      className="help-text"
      :model-value="modelValue"
      :error="error"
      :label="label"
      :help-text="helpText"
      :update="updateModelValue"
    >
      <label v-if="label" :for="id">
        {{ label }}
      </label>
    </slot>

    <slot
      :id="id"
      name="help"
      className="help-text"
      :model-value="modelValue"
      :error="error"
      :label="label"
      :help-text="helpText"
      :update="updateModelValue"
    >
      <p v-if="helpText" class="help-text">
        {{ helpText }}
      </p>
    </slot>

    <slot
      :id="id"
      :inputName="name"
      :modelValue="modelValue"
      :error="error"
      :label="label"
      :helpText="helpText"
      :update="updateModelValue"
    >
      <input
        :id="id"
        type="text"
        :name="name"
        :value="modelValue"
        :class="{ error }"
        v-bind="$attrs"
        @input="updateModelValue($event.target.value)"
        @focus="$event.target.select()"
      />
    </slot>

    <p v-if="error" class="error">
      <slot
        :id="id"
        name="error"
        :model-value="modelValue"
        :error="error"
        :label="label"
        :help-text="helpText"
        :update="updateModelValue"
      >
        {{ error }}
      </slot>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import uuid4 from '@/utils/uuid4';

export type validationFunc = (value: string) => string | boolean;

export default defineComponent({
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default: uuid4(),
    },
    name: {
      type: String,
      default: uuid4(),
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
      default: undefined,
    },
  },
  emits: [
    'update:modelValue',
    'update:error',
  ],
  setup(props, { emit }) {
    function updateModelValue(value: string) {
      emit('update:modelValue', value);

      if (props.validator) {
        const isValid = props.validator(value);
        emit('update:error', isValid === true ? '' : isValid);
      }
    }

    return {
      updateModelValue,
    };
  },
});
</script>
