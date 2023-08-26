<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue';

const props = withDefaults(
  defineProps<{
    show: boolean;

    // The title of the modal dialog
    title?: string;

    // If the dialog can be cancelled
    canCancel?: boolean;

    // If the dialog can be submitted
    canSubmit?: boolean;

    // The label of the cancel button
    cancelLabel?: string;

    // The label of the submit button
    submitLabel?: string;
  }>(),
  {
    title: undefined,
    canCancel: true,
    canSubmit: true,
    cancelLabel: undefined,
    submitLabel: 'Ok',
  }
);

const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();

// Reference to the dialog element
const dialogElement = ref<HTMLDialogElement>();

// Reference to the dialog's form element
const formElement = ref<HTMLFormElement>();

// Classes applied to the dialog element
const dialogClass = computed(() => [
  'modal',

  {
    closing: !props.show,
  },
]);

// Handle the dialog's cancel event (Esc key) or a cancel button press
function handleDialogCancel(e: Event) {
  e.preventDefault();

  if (props.cancelLabel) {
    if (!props.canCancel) return;
    emit('cancel');
  } else {
    // No cancel button exists, try to submit the form
    formElement.value?.requestSubmit();
  }
}

// Handle the form's submit event
function handleFormSubmit(e: Event) {
  e.preventDefault();
  if (!dialogElement.value) return;
  emit('submit');
}

// Close the dialog after the animation completes
function handleDialogAnimation() {
  dialogElement.value?.removeEventListener(
    'animationend',
    handleDialogAnimation
  );

  dialogElement.value?.close();
}

watchEffect(() => {
  if (!dialogElement.value) return;

  if (props.show === true) {
    dialogElement.value.showModal();
  } else if (dialogElement.value.open) {
    dialogElement.value.addEventListener('animationend', handleDialogAnimation);
  }
});
</script>

<template>
  <dialog ref="dialogElement" :class="dialogClass" @cancel="handleDialogCancel">
    <form
      ref="formElement"
      method="dialog"
      class="modal__form"
      @submit="handleFormSubmit"
    >
      <div v-if="title" class="modal__title">
        <slot name="title">
          <h2>{{ title }}</h2>
        </slot>
      </div>

      <div class="modal__content">
        <slot />
      </div>

      <div class="modal__actions">
        <slot name="actions" :activate-cancel="handleDialogCancel">
          <button
            v-if="props.cancelLabel"
            type="button"
            class="secondary"
            :disabled="!props.canCancel"
            @click="handleDialogCancel"
          >
            <slot name="cancelLabel" :label="props.cancelLabel">
              {{ props.cancelLabel }}
            </slot>
          </button>

          <button type="submit" class="primary" :disabled="!props.canSubmit">
            <slot name="submitLabel" :label="props.submitLabel">
              {{ props.submitLabel }}
            </slot>
          </button>
        </slot>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
dialog {
  margin: 0 auto;
  width: clamp(30rem, 50vw, 40rem);
  isolation: isolate;

  font-size: 1rem;
  color: hsl(var(--clr-primary-400));
  background-color: hsl(var(--clr-neutral-100));

  border: none;
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);

  box-shadow: 0 0 2rem 0.25rem hsl(0 0% 0% / 0.3);
}

dialog::backdrop {
  background-color: hsl(0 0% 0% / 0.25);
  backdrop-filter: blur(1px);
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
  }
  to {
    opacity: 0;
  }
}

dialog[open],
dialog[open]::backdrop {
  animation: modal-fade-in 0.2s;
}

dialog.closing,
dialog.closing::backdrop {
  animation: modal-fade-out 0.2s;
}

@media screen and (min-height: 40rem) {
  dialog {
    margin-top: 20vh;
    border-radius: var(--border-radius);
  }
}

h2 {
  font-size: 2rem;
  line-height: 1.5;
}

dialog.large {
  margin-top: 0;
  width: clamp(25rem, 50rem, 50rem);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.modal__title {
  --clr-font: var(--clr-primary-400);
  --clr-bg: var(--clr-neutral-400);
  --clr-border: var(--clr-neutral-500);

  color: hsl(var(--clr-font));
  background-color: hsl(var(--clr-bg));
  border-bottom: 1px solid hsl(var(--clr-border));

  position: sticky;
  top: 0;
  z-index: 1;

  padding: 0.5em 1em;
}

dialog.destructive .modal__title {
  --clr-font: var(--clr-destructive-100);
  --clr-bg: var(--clr-destructive-400);
}

dialog.accent1 .modal__title {
  --clr-font: var(--clr-accent1-100);
  --clr-bg: var(--clr-accent1-400);
}

.modal__content {
  padding: 1em 1em 0 1em;
}

.modal__actions {
  background-color: hsl(var(--clr-neutral-100));

  position: sticky;
  bottom: 0;

  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  padding: 1em;
}
</style>
