<script lang="ts" setup>
import { defineAsyncComponent, computed, ref, watchEffect } from 'vue';

// Types
import type { ShareType } from '@/admin/common/services/shareType';
import type { GlobalStore } from '@/admin/common/stores/global';
import type { Instance as ServiceInstance } from '@/admin/common/services/instance';

// Utils
import { BASE_URLS } from '@/common/constants';

// Validators
import validateStringLength from '@/common/validators/validateStringLength';

// Components
import {
  VOption,
  VDivider,
  VSelect,
  VInput,
  VCopyInput,
} from '@/common/components/inputs';

import LoadingLabel from '@/common/components/LoadingLabel.vue';

import ModalDialog from '@/common/components/ModalDialog.vue';

const ShareTypeSelector = defineAsyncComponent(async () => {
  const { ShareTypeSelector: component } = await import(
    '@/admin/common/components/ShareTypeSelector'
  );

  return component;
});

type Instance = ServiceInstance | null;

enum ModalState {
  ADD,
  EDIT,
  DELETE,
  ACTIVE,
  INVITE_CODE,
  DIVIDEND,
}

const props = withDefaults(
  defineProps<{
    modelValue: Instance;

    // The store to use when querying and performing CRUD operations
    store: GlobalStore;

    // A unique name for this component
    name?: string;

    // A unique ID for this component
    id?: string;

    // The prompt to use when there's currently no item selected
    prompt?: string;

    // The label displayed above the select box
    label?: string;

    // Helper text displayed above the select box
    helpText?: string;

    // The width of the select element
    width?: string;

    // If the entire select element is disabled
    disabled?: boolean;

    // If the value is required
    required?: boolean;
  }>(),
  {
    prompt: 'Choose an instance...',
    name: undefined,
    id: undefined,
    label: undefined,
    helpText: undefined,
    width: undefined,
    disabled: undefined,
    required: undefined,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: Instance): void;
}>();

// Convenience property for getting and setting the current error.
const error = computed({
  get() {
    return props.store.error.error.value;
  },

  set(val: string | null) {
    props.store.error.setCurrentError(val);
  },
});

// The InstanceStore this component is attached to
const instanceStore = computed(() => props.store.instance);

// True when the data is being processed
const loading = ref(false);

// If the modal is open.
const modalShown = ref(false);

// The value of the selected share type
const selectedShareType = ref<ShareType | null>(null);

// The input to add/rename an instance
const input = ref('');

// The error message, if there was an error
const inputError = ref('');

// The current state of the modal
const modalState = ref(ModalState.ADD);

// The array of options presented to the base select component
const options = computed(() => instanceStore.value.instances.value);

// The current invite code
const inviteCode = computed(
  () => instanceStore.value.selected.value?.inviteCode ?? 'UNKNOWN'
);

// URL to send to students
const inviteUrl = computed(() => {
  const baseUrl = `${window.location.protocol}//${window.location.host}/${BASE_URLS.REGISTER}?i=${inviteCode.value}`;
  return baseUrl;
});

// The title of the modal window
const modalTitle = computed(() => {
  switch (modalState.value) {
    case ModalState.ADD:
      return 'Create an Instance';
    case ModalState.EDIT:
      return 'Rename an Instance';
    case ModalState.ACTIVE:
      return 'Activate an Instance';
    case ModalState.INVITE_CODE:
      return 'Invite Code';
    case ModalState.DIVIDEND:
      return 'Post Dividends';
    default:
      return 'Are you sure?';
  }
});

// The class of the modal window
const modalClass = computed(() => {
  if (modalState.value === ModalState.DELETE) {
    return 'destructive';
  }

  return null;
});

// The label assigned to the cancel button (and if it's shown)
const modalCancelLabel = computed(() => {
  if (modalState.value === ModalState.INVITE_CODE) {
    return undefined;
  }

  return 'Cancel';
});

// True if the modal is in a state that would permit submission
const modalCanSubmit = computed(() => {
  if (loading.value) return false;

  if ([ModalState.ADD, ModalState.EDIT].includes(modalState.value)) {
    if (inputError.value.length > 0) return false;
  }

  if (modalState.value === ModalState.DIVIDEND) {
    if (inputError.value.length > 0) return false;
    if (selectedShareType.value === null) return false;
  }

  return true;
});

// True if the modal is in a state that would permit cancellation.
const modalCanCancel = computed(() => !loading.value);

// Cascade the model update
function update(item: unknown) {
  emit('update:modelValue', item as Instance);
}

// Open or close the New Instance form.
function modalToggle() {
  modalShown.value = !modalShown.value;
}

// Begin the invite code process
function startInviteCode() {
  modalState.value = ModalState.INVITE_CODE;
  modalToggle();
}

// Begin the make active process and open the modal.
function startActive() {
  modalState.value = ModalState.ACTIVE;
  input.value = '';
  modalToggle();
}

// Begin the new instance process and open the modal.
function startAdd() {
  modalState.value = ModalState.ADD;
  input.value = '';
  modalToggle();
}

// Begin the rename process and open the modal.
function startEdit() {
  if (props.modelValue === null) return;
  modalState.value = ModalState.EDIT;
  input.value = props.modelValue?.description ?? 'ERROR';
  modalToggle();
}

// Open the delete confirmation dialog when the user wishes to delete an instance.
function startDelete() {
  if (props.modelValue === null) return;
  modalState.value = ModalState.DELETE;
  modalToggle();
}

// Open the dividend posting modal
function startDividend() {
  if (!props.modelValue) return;
  modalState.value = ModalState.DIVIDEND;
  modalToggle();
}

// Add a new instance and Update or Delete the selected instance.
async function handleOk() {
  if (modalState.value === ModalState.ADD) {
    if (input.value.length < 3) {
      error.value = 'Instance must have a description!';
      return;
    }

    loading.value = true;

    try {
      const instance = await instanceStore.value.create({
        description: input.value,
      });

      update(instance);
      modalToggle();
    } catch (e) {
      if (!(e instanceof Error)) return;
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  if (modalState.value === ModalState.EDIT) {
    if (input.value.length < 3) {
      error.value = 'Instance must have a description!';
      return;
    }

    if (props.modelValue === null) return;

    loading.value = true;

    try {
      const instance = await instanceStore.value.update({
        id: props.modelValue?.id ?? -1,
        description: input.value,
      });

      update(instance);
      modalToggle();
    } catch (e) {
      if (!(e instanceof Error)) return;
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  if (modalState.value === ModalState.ACTIVE) {
    if (props.modelValue === null) return;

    loading.value = true;

    try {
      const instance = await instanceStore.value.update({
        id: props.modelValue?.id ?? -1,
        isActive: true,
      });

      update(instance);
      modalToggle();
    } catch (e) {
      if (!(e instanceof Error)) return;
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  if (modalState.value === ModalState.DELETE) {
    if (!props.modelValue) return;

    loading.value = true;

    try {
      await instanceStore.value.remove(props.modelValue);
      update(null);
      modalToggle();
    } catch (e) {
      if (!(e instanceof Error)) return;
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  if (modalState.value === ModalState.DIVIDEND) {
    if (!instanceStore.value.selected.value) return;
    if (!selectedShareType.value) return;

    loading.value = true;

    try {
      await props.store.shareType.postDividends({
        instances: instanceStore.value.selected.value.id,
        shareTypeId: selectedShareType.value.id,
      });

      modalToggle();
    } catch (e) {
      if (!(e instanceof Error)) return;
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  if (modalState.value === ModalState.INVITE_CODE) {
    modalToggle();
  }
}

// Reset the input and close the modal.
function handleCancel() {
  input.value = '';
  selectedShareType.value = null;
  modalToggle();
}

watchEffect(() => {
  if (selectedShareType.value === null) return;

  if (selectedShareType.value.dividendRate > 0) {
    inputError.value = '';
  } else {
    inputError.value = 'The selected share type has a dividend rate of 0%.';
  }
});
</script>

<template>
  <v-select v-bind="{ ...props, ...$attrs }" @update:model-value="update">
    <template #activatorLabel="{ prompt: labelText }">
      <template v-if="modelValue?.isActive">
        <span class="active">(Active)</span>
      </template>

      {{ modelValue?.description ?? labelText }}
    </template>

    <v-option v-for="option in options" :key="option.id" :value="option">
      <template v-if="option.isActive">
        <span class="active">(Active)</span>
      </template>

      {{ option.description }}
    </v-option>

    <v-divider />

    <v-option @click="startAdd"> Add... </v-option>

    <v-option :disabled="modelValue === null" @click="startEdit">
      Rename...
    </v-option>

    <v-option :disabled="modelValue === null" @click="startDelete">
      Delete...
    </v-option>

    <v-option :disabled="modelValue === null" @click="startActive">
      Activate...
    </v-option>

    <v-divider />

    <v-option :disabled="modelValue === null" @click="startDividend">
      Post Dividends...
    </v-option>

    <v-option :disabled="modelValue === null" @click="startInviteCode">
      Invite Code...
    </v-option>
  </v-select>

  <modal-dialog
    :title="modalTitle"
    :class="modalClass"
    :show="modalShown"
    :cancel-label="modalCancelLabel"
    :can-submit="modalCanSubmit"
    :can-cancel="modalCanCancel"
    @submit="handleOk"
    @cancel="handleCancel"
  >
    <template #submitLabel="{ label: labelText }">
      <loading-label :show="loading">
        {{ loading ? 'Loading...' : labelText }}
      </loading-label>
    </template>

    <template v-if="modalState === ModalState.DELETE">
      This action cannot be undone!
    </template>

    <template v-else-if="modalState === ModalState.ACTIVE">
      <strong>Warning:</strong> Making this instance active will mark all other
      instances inactive. Students in inactive instances cannot log in.
    </template>

    <template v-else-if="modalState === ModalState.INVITE_CODE">
      <v-copy-input
        v-model="inviteUrl"
        name="inviteUrl"
        label="Invite Code URL"
      />

      <v-copy-input
        v-model="inviteCode"
        name="inviteCode"
        label="Invite Code"
      />
    </template>

    <template v-else-if="modalState === ModalState.DIVIDEND">
      <share-type-selector
        v-model="selectedShareType"
        :store="props.store"
        label="Share Type"
        help-text="Select the Share Type you want to post dividends for."
      />

      <p v-if="inputError.length > 0" class="error">{{ inputError }}</p>
    </template>

    <template v-else>
      <v-input
        v-model="input"
        v-model:error="inputError"
        :validator="validateStringLength(3)"
        name="instance-name"
        label="Name"
        required
      />
    </template>
  </modal-dialog>
</template>

<style scoped>
span.active {
  font-size: 0.7em;
  vertical-align: middle;
}
</style>
