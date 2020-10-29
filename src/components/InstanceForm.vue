<template>
  <Modal :show="show" :title="title" cancelLabel="Cancel" @ok.prevent="ok" @focus.self="onFocus">
    <input ref="elDescription" name="instance-description" type="text" v-model="input" placeholder="Instance Name"/>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import Modal from './Modal.vue';

/**
 * This modal enables users to provide information about an instance.
 */
export default defineComponent({
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false,
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
    title: {
      type: String,
      required: false,
      default: 'Create an Instance',
    },
  },
  components: {
    Modal,
  },
  setup(props, { emit }) {
    const input = ref(props.description);

    const elDescription = ref<HTMLInputElement|null>(null);

    // Reset the description when the box is shown
    watchEffect(() => {
      if (props.show === true) {
        input.value = props.description;
      }
    });

    /**
     * When the modal is focused, highlight the contents of the description box.
     */
    function onFocus() {
      setTimeout(() => {
        if (elDescription.value !== null) {
          elDescription.value.focus();
          elDescription.value.select();
        }
      }, 10);
    }

    /**
     * When the user presses OK or hits Enter, submit the description to the parent.
     */
    function ok() {
      emit('ok', input.value);
    }

    return {
      ok,
      onFocus,
      input,
      elDescription,
    };
  },
});
</script>

<style lang="scss" scoped>
  .modal__container__content {
    display: flex;
    flex-direction: column;

    & label {
      font-weight: bold;
    }

    & input {
      height: 2rem;
      font-size: 1.2rem;
      margin-right: 1rem;
      width: calc(100% - 0.5rem);
    }
  }
</style>
