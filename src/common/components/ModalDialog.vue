<template>
  <teleport to="#modal">
    <div
      ref="root"
      class="modal"
      :style="modalStyle"
      :class="[{ 'modal--open': show, 'modal--hidden': !show && closedBefore }]"
      v-bind="$attrs"
    >
      <div class="modal__container">
        <div v-if="title" class="modal__container__title">
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
            :cancel-label="cancelLabel"
            :ok-label="okLabel"
            :handle-cancel="handleCancel"
            :handle-ok="handleOk"
            :can-submit="canSubmit"
            :can-cancel="canCancel"
          >
            <button
              v-if="cancelLabel"
              class="modal__container__buttons__cancel"
              :class="[cancelButtonClass]"
              :disabled="!canCancel"
              type="button"
              @click.prevent="handleCancel"
            >
              <slot
                name="cancelLabel"
                :cancel-label="cancelLabel"
                :can-cancel="canCancel"
              >
                {{ cancelLabel }}
              </slot>
            </button>
            <button
              ref="okButton"
              class="modal__container__buttons__ok"
              :class="[okButtonClass]"
              :disabled="!canSubmit"
              type="button"
              @click.prevent="handleOk"
            >
              <slot name="okLabel" :ok-label="okLabel" :can-submit="canSubmit">
                {{ okLabel }}
              </slot>
            </button>
          </slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, watchEffect } from 'vue';
import modalStore from '@/common/stores/modal';
import useDebounce from '@/common/composables/useDebounce';

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
  emits: ['ok', 'cancel', 'focus'],
  setup(props, { emit }) {
    const root = ref<HTMLDivElement | null>(null);
    const okButton = ref<HTMLButtonElement | null>(null);
    const closedBefore = ref(false);

    function ok(e: ModalEvent) {
      emit('ok', e);
    }

    function cancel(e: ModalEvent) {
      emit('cancel', e);
    }

    // If the OK/Cancel button is focused and the enter key is pressed, prevent sending the event twice.
    const handleOk = useDebounce(ok, 100);
    const handleCancel = useDebounce(
      props.cancelLabel ? cancel : () => undefined,
      100
    );

    // Watch for Escape and Enter key-presses and call the appropriate handler.
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
        setTimeout(
          () => document.addEventListener('keyup', handleKeyPress),
          100
        );

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
        if (document.activeElement) {
          (document.activeElement as HTMLElement).blur();
        }

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
      zIndex:
        root.value !== null && modalStore.topmost.value === root.value
          ? 1000
          : 900,
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

<style>
.modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 1rem; /* Reset fonts for this modal */
  display: flex;
  flex-direction: column;
}

.modal.modal--hidden {
  animation: modal-fade-out 0.2s;
}

.modal.modal--open {
  opacity: 1;
  visibility: visible;
  animation: modal-fade-in 0.2s;
}

.modal .modal__container {
  background-color: hsl(var(--primary-bg-color));
}

@media screen and (min-width: 700px) {
  .modal .modal__container {
    margin: 0 auto;
    width: clamp(450px, 50vw, 600px);
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
}

@media screen and (min-height: 400px) {
  .modal .modal__container {
    margin-top: 30vmin;
    max-height: calc(100% - 30vmin);
    overflow-y: auto;
  }
}

@media screen and (min-width: 700px) and (min-height: 400px) {
  .modal .modal__container {
    border-radius: 0.25rem;
  }
}

.modal .modal__container__title {
  background-color: hsl(var(--primary-bg-color));
  border-bottom: 1px solid hsl(var(--primary-bg-color-dark2));

  @media screen and (min-width: 700px) and (min-height: 400px) {
    border-radius: 0.25rem 0.25rem 0 0;
  }
}

.modal .modal__container__title h1 {
  font-size: 1.75rem;
}

.modal .modal__container__title,
.modal .modal__container__buttons {
  padding: 1em;
}

.modal .modal__container__content {
  padding: 1em;
  min-height: 0px;
}

.modal .modal__container__buttons {
  display: flex;
  flex-direction: column;
}

@media screen and (min-width: 300px) {
  .modal .modal__container__buttons {
    flex-direction: row;
    justify-content: flex-end;
  }
}

.modal.destructive .modal__container__title {
  color: hsl(var(--destructive-font-color));
  background-color: hsl(var(--destructive-bg-color));
}

.modal.destructive .modal__container__buttons__ok {
  outline: 0;
  padding: 0.5em;
  margin: 0.25em;
  min-width: 100px;
  cursor: pointer;

  color: hsl(var(--destructive-font-color));
  background-color: hsl(var(--destructive-bg-color));
  border: 1px solid hsl(var(--destructive-bg-color-dark2));
  border-radius: 3px;

  transition-property: background-color;
  transition-duration: 0.15s;
  transition-delay: 0;
}

.modal.destructive .modal__container__buttons__ok:disabled {
  cursor: inherit;
  color: hsla(var(--destructive-font-color) / 0.5);
  background-color: hsl(--destructive-bg-color-light2);
  border-color: hsl(--destructive-bg-color-light1);
}

.modal.destructive .modal__container__buttons__ok:hover,
.modal.destructive .modal__container__buttons__ok:focus,
.modal.destructive .modal__container__buttons__ok:active {
  color: hsla(var(--destructive-font-color) / 0.85);
  background-color: hsl(var(--destructive-bg-color-dark1));
  border-color: hsl(var(--destructive-bg-color-dark2));
}

.modal.large .modal__container {
  margin: 0 auto;
  width: 90%;
  max-width: 1080px;
  max-height: 90vh;
  overflow: auto;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
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
