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
      :update="updateModelValue"
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
      :update="updateModelValue"
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
      :update="updateModelValue"
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
        @input="updateModelValue($event.target.value)"
        @focus="$event.target.select()"
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
        :update="updateModelValue"
        :attrs="$attrs"
      >
        {{ error }}
      </slot>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, watchEffect } from 'vue';
import uuid4 from '@/utils/uuid4';

export type validationFunc = (value: string) => string | boolean;

export default defineComponent({
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
    required: {
      type: Boolean,
      default: false,
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
    const inputId = computed(() => {
      if (props.id) return props.id;
      return uuid4();
    });

    function updateModelValue(value: string) {
      emit('update:modelValue', value);
    }

    watchEffect(() => {
      const { modelValue, validator } = props;
      if (!validator) return;

      const error = validator(modelValue.toString());
      emit('update:error', error === true ? '' : error);
    });

    return {
      inputId,
      updateModelValue,
    };
  },
});
</script>
