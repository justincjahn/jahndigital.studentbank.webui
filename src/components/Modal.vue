<template>
  <Teleport to="#modal">
    <div
      ref="root"
      class="modal"
      :style="modalStyle"
      :class="[{ 'modal--open': show, 'modal--hidden': !show && closedBefore }]"
      v-bind="$attrs"
    >
      <div class="modal__container">
        <div
          v-if="title"
          class="modal__container__title"
        >
          <slot name="title">
            <h1>{{ title }}</h1>
          </slot>
        </div>
        <div class="modal__container__content">
          <slot />
        </div>
        <div class="modal__container__buttons">
          <slot
            name="buttons"
            :cancelLabel="cancelLabel"
            :okLabel="okLabel"
            :handleCancel="handleCancel"
            :handleOk="handleOk"
            :canSubmit="canSubmit"
            :canCancel="canCancel"
          >
            <button
              v-if="cancelLabel"
              tabindex="1"
              class="modal__container__buttons__cancel"
              :class="[cancelButtonClass]"
              :disabled="!canCancel"
              @click.prevent="handleCancel"
            >
              <slot
                name="cancelLabel"
                :cancelLabel="cancelLabel"
                :canCancel="canCancel"
              >
                {{ cancelLabel }}
              </slot>
            </button>
            <button
              ref="okButton"
              tabindex="0"
              class="modal__container__buttons__ok"
              :class="[okButtonClass]"
              :disabled="!canSubmit"
              @click.prevent="handleOk"
            >
              <slot
                name="okLabel"
                :okLabel="okLabel"
                :canSubmit="canSubmit"
              >
                {{ okLabel }}
              </slot>
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, watchEffect } from 'vue';
import modalStore from '@/store/modal';
import debounce from '@/utils/debounce';

/**
 * Describes the possible event types that might be provided to the callback functions.
 */
export type ModalEvent = MouseEvent | KeyboardEvent | KeyboardEvent | null;

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false,
    },
    title: {
      type: String,
      required: false,
      default: null,
    },
    okLabel: {
      type: String,
      required: false,
      default: 'Ok',
    },
    okButtonClass: {
      type: String,
      required: false,
      default: 'primary',
    },
    cancelLabel: {
      type: String,
      required: false,
      default: null,
    },
    cancelButtonClass: {
      type: String,
      required: false,
      default: '',
    },
    canSubmit: {
      type: Boolean,
      required: false,
      default: true,
    },
    canCancel: {
      type: Boolean,
      required: false,
      default: true,
    },
    handleEnter: {
      type: Boolean,
      required: false,
      default: true,
    },
    handleEscape: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: [
    'ok',
    'cancel',
    'focus',
  ],
  setup(props, { emit }) {
    const root = ref<HTMLDivElement|null>(null);
    const okButton = ref<HTMLButtonElement|null>(null);
    const closedBefore = ref(false);

    function ok(e: ModalEvent) {
      emit('ok', e);
    }

    function cancel(e: ModalEvent) {
      emit('cancel', e);
    }

    // If the OK/Cancel button is focused and the enter key is pressed, prevent sending the event twice.
    const handleOk = debounce(ok, 100);
    const handleCancel = debounce(props.cancelLabel ? cancel : () => undefined, 100);

    // Watch for Escape and Enter keypresses and call the appropriate handler.
    function handleKeyPress(e: KeyboardEvent) {
      // Ignore keypress if we're not the top modal
      if (root.value === null || modalStore.topmost.value !== root.value) {
        return;
      }

      if (e.key === 'Escape' && props.handleEscape) {
        e.preventDefault();

        if (props.cancelLabel) {
          handleCancel(e);
        } else {
          handleOk(e);
        }
      }

      if (e.key === 'Enter' && props.handleEnter) {
        e.preventDefault();
        handleOk(e);
      }
    }

    // Fired when the modal is shown or hidden.
    watchEffect(() => {
      if (props.show === true) {
        closedBefore.value = true;
        document.addEventListener('keyup', handleKeyPress);

        if (root.value !== null) {
          modalStore.open(root.value);
        }
      } else if (root.value !== null) {
        modalStore.close(root.value);
      }

      if (props.show === false) {
        document.removeEventListener('keyup', handleKeyPress);
      }
    });

    // When the modal is at the top level, emit a focus event.
    watchEffect(() => {
      if (root.value !== null && modalStore.topmost.value === root.value) {
        emit('focus', root.value);
      }
    });

    onUnmounted(() => {
      document.removeEventListener('keyup', handleKeyPress);

      if (root.value !== null) {
        modalStore.close(root.value);
      }
    });

    const modalStyle = computed(() => ({
      zIndex: (root.value !== null && modalStore.topmost.value === root.value) ? 100 : 50,
    }));

    return {
      handleOk,
      handleCancel,
      root,
      okButton,
      closedBefore,
      modalStyle,
    };
  },
});
</script>

<style lang="scss">
.modal {
  position: fixed;
  z-index: 500;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;
  overflow: hidden;
  background-color: rgba(0,0,0,0.5);
  font-size: 1rem; /* Reset fonts for this modal */

  &.modal--hidden {
    animation: modal-fade-out 0.2s;
  }

  &.modal--open {
    opacity: 1;
    visibility: visible;
    animation: modal-fade-in 0.2s;
  }

  .modal__container {
    background-color: map.get($theme, primary, color);
    margin: 10% auto;
    border-radius: 6px;
    width: 500px;

    &__title {
      background-color: map.get($theme, secondary, color);
      border-radius: 6px 6px 0 0;
      border-bottom: 1px solid colorStep(secondary, $step: 2);

      & h1 { font-size: 1.75rem; }
    }

    &__title, &__buttons {
      padding: 1em;
    }

    &__content {
      padding: 1em;
      min-height: 0px;
    }

    &__buttons {
      display: flex;
      justify-content: flex-end;
    }
  }

  &.destructive .modal__container__title {
    color: map.get($theme, button-destructive, font-color);
    background-color: map.get($theme, button-destructive, color);
  }

  &.destructive .modal__container__buttons .modal__container__buttons__ok {
    @include button(button-destructive);
  }

  // Large modal container is attached to the top of the window and spans the page
  &.large {
    .modal__container {
      margin: 0 auto;
      width: 90%;
      max-width: 1080px;
      max-height: 90vh;
      overflow: auto;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}

@keyframes modal-fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes modal-fade-out {
    from {
        opacity: 1;
        visibility: visible;
    }
    to {
        opacity: 0;
        visibility: hidden;
    }
}
</style>
