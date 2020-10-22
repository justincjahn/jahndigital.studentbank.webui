<template>
  <div class="modal" ref="root" :class="[{ 'modal--open': show, 'modal--hidden': !show && closedBefore }, customClass]">
    <div class="modal__container">
      <div v-if="title" class="modal__container__title"><h1>{{title}}</h1></div>
      <div class="modal__container__content"><slot /></div>
      <div class="modal__container__buttons">
        <button tabindex="1" class="modal__container__buttons__cancel" v-if="cancelLabel" @click.prevent="cancel">{{cancelLabel}}</button>
        <button tabindex="0" class="modal__container__buttons__ok" @click.prevent="ok">{{okLabel}}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref, watchEffect } from 'vue';

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
    customClass: {
      type: String,
      required: false,
      default: null,
    },
    okLabel: {
      type: String,
      required: false,
      default: 'Ok',
    },
    cancelLabel: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props, { emit }) {
    const root = ref<HTMLDivElement|null>(null);
    const closedBefore = ref(false);
    console.log(props.customClass);

    function ok(e: ModalEvent) {
      emit('ok', e);
    }

    function cancel(e: ModalEvent) {
      emit('cancel', e);
    }

    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();

        if (props.cancelLabel) {
          cancel(e);
        } else {
          ok(e);
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        ok(e);
      }
    }

    watchEffect(() => {
      if (props.show === true) {
        closedBefore.value = true;
      }
    });

    watchEffect(() => {
      if (props.show === true) {
        document.addEventListener('keyup', handleKeyPress);
      }

      if (props.show === false) {
        document.removeEventListener('keyup', handleKeyPress);
      }
    });

    onUnmounted(() => {
      document.removeEventListener('keyup', handleKeyPress);
    });

    return {
      ok,
      cancel,
      root,
      closedBefore,
    };
  },
});
</script>

<style lang="scss">
div.modal {
  $clrBtnPrimary: map.get($theme, button-primary, color);
  $stpBtnPrimary: map.get($theme, button-primary, step);
  $clrBtnSecondary: map.get($theme, button-secondary, color);
  $stpBtnSecondary: map.get($theme, button-secondary, step);
  $clrBtnDestructive: map.get($theme, button-destructive, color);
  $stpBtnDestructive: map.get($theme, button-destructive, step);
  $clrPrimary: map.get($theme, primary, color);
  $clrSecondary: map.get($theme, secondary, color);

  position: fixed;
  z-index: 1;
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
    background-color: $clrPrimary;
    margin: 10% auto;
    border-radius: 6px;
    width: 500px;

    .modal__container__title {
      background-color: $clrSecondary;
      border-radius: 6px 6px 0 0;
      border-bottom: 1px solid darken(
        $clrSecondary,
        map.get($theme, secondary, step)
      );

      & h1 {
        font-size: 1.75rem;
      }
    }

    .modal__container__title, .modal__container__buttons {
      padding: 1em;
    }

    .modal__container__content {
      padding: 1em;
      min-height: 0px;
    }

    .modal__container__buttons {
      display: flex;
      justify-content: flex-end;

      & button {
        outline: 0;
        margin: 0.25em;
        padding: 0.5em;
        min-width: 100px;

        border: 1px solid darken(
          $clrBtnSecondary,
          map.get($theme, button-secondary, step)
        );

        color: map.get($theme, button-secondary, font-color);
        background-color: $clrBtnSecondary;
        border-radius: 3px;
        transition-property: background-color;
        transition-duration: 0.15s;
        transition-delay: 0;

        &:hover, &:focus {
          background-color: darken(
            $clrBtnSecondary,
            $stpBtnSecondary
          );

          border-color: darken(
            $clrBtnSecondary,
            $stpBtnSecondary + $stpBtnSecondary
          );
        }

        &:active {
          background-color: darken(
            $clrBtnSecondary,
            $stpBtnSecondary + $stpBtnSecondary
          );

          border-color: darken(
            $clrBtnSecondary,
            $stpBtnSecondary + $stpBtnSecondary + $stpBtnSecondary
          );
        }

        .modal__container__buttons__ok {
          font-weight: bold;
          color: map.get($theme, button-primary, font-color);
          background-color: $clrBtnPrimary;
          border-color: darken(
            $clrBtnPrimary,
            $stpBtnPrimary
          );

          &:hover, &:focus {
            background-color: darken(
              $clrBtnPrimary,
              $stpBtnPrimary
            );

            border-color: darken(
              $clrBtnPrimary,
              $stpBtnPrimary + $stpBtnPrimary
            );
          }
        }
      }
    }
  }

  &.destructive .modal__container__title {
    color: map.get($theme, button-destructive, font-color);
    background-color: $clrBtnDestructive;
  }

  &.destructive .modal__container__buttons .modal__container__buttons__ok {
    color: map.get($theme, button-destructive, font-color);
    background-color: $clrBtnDestructive;

    border-color: darken(
      $clrBtnDestructive,
      $stpBtnDestructive
    );

    &:hover, &:focus {
      background-color: darken(
        $clrBtnDestructive,
        $stpBtnDestructive
      );

      border-color: darken(
        $clrBtnDestructive,
        $stpBtnDestructive + $stpBtnDestructive
      );
    }

    &:active {
      background-color: darken(
        $clrBtnDestructive,
        $stpBtnDestructive + $stpBtnDestructive
      );

      border-color: darken(
        $clrBtnDestructive,
        $stpBtnDestructive + $stpBtnDestructive + $stpBtnDestructive
      );
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
