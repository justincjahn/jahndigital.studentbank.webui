<script lang="ts" setup>
import { computed, ref } from 'vue';

// Types
import type { GlobalStore } from '@/admin/common/stores/global';
import type { Instance as ServiceInstance } from '@/admin/common/services/instance';

// Utils
import { BASE_URLS } from '@/common/constants';
import useUniqueId from '@/common/composables/useUniqueId';

// Components
import {
  VOption,
  VDivider,
  VSelect,
  VInput,
  VCopyInput,
} from '@/common/components/inputs';

import ModalDialog from '@/common/components/ModalDialog.vue';

// @TODO: Fix this.
// const DividendPostingModal = defineAsyncComponent(() => import('./DividendPostingModal.vue'));

type Instance = ServiceInstance | null;

enum ModalState {
  ADD,
  EDIT,
  DELETE,
  ACTIVE,
  INVITE_CODE,
}

const props = withDefaults(
  defineProps<{
    modelValue: Instance;

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
    name: `instance-selector-${useUniqueId()}`,
    id: `input-${useUniqueId().toString()}`,
    prompt: 'Choose instance...',
    label: '',
    helpText: '',
    width: '10rem',
    disabled: false,
    required: false,
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

// If the modal is open.
const showModal = ref(false);

// If the dividend posting modal is open.
const showDividendPostingModal = ref(false);

// The input to add/rename an instance
const input = ref('');

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
  if (modalState.value === ModalState.ADD) {
    return 'Create an Instance';
  }

  if (modalState.value === ModalState.EDIT) {
    return 'Rename Instance';
  }

  if (modalState.value === ModalState.ACTIVE) {
    return 'Activate Instance';
  }

  if (modalState.value === ModalState.INVITE_CODE) {
    return 'Invite Code';
  }

  return 'Are you sure?';
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

// Cascade the model update
function update(item: unknown) {
  emit('update:modelValue', item as Instance);
}

// Open or close the New Instance form.
function toggle() {
  showModal.value = !showModal.value;
}

// Open or close the Dividend Posting Modal
function toggleDividendPostingModal() {
  showDividendPostingModal.value = !showDividendPostingModal.value;
}

// Begin the invite code process
function startInviteCode() {
  modalState.value = ModalState.INVITE_CODE;
  toggle();
}

// Begin the make active process and open the modal.
function startActive() {
  modalState.value = ModalState.ACTIVE;
  input.value = '';
  toggle();
}

// Begin the new instance process and open the modal.
function startAdd() {
  modalState.value = ModalState.ADD;
  input.value = '';
  toggle();
}

// Begin the rename process and open the modal.
function startEdit() {
  if (props.modelValue === null) return;
  modalState.value = ModalState.EDIT;
  input.value = props.modelValue?.description ?? 'ERROR';
  toggle();
}

// Open the delete confirmation dialog when the user wishes to delete an instance.
function startDelete() {
  if (props.modelValue === null) return;
  modalState.value = ModalState.DELETE;
  toggle();
}

// Add a new instance and Update or Delete the selected instance.
async function handleOk() {
  if (modalState.value === ModalState.ADD) {
    if (input.value.length < 3) {
      error.value = 'Instance must have a description!';
      return;
    }

    try {
      const instance = await instanceStore.value.newInstance({
        description: input.value,
      });
      update(instance);
      toggle();
    } catch (e) {
      if (e instanceof Error) {
        error.value = e.message;
      }
    }
  }

  if (modalState.value === ModalState.EDIT) {
    if (input.value.length < 3) {
      error.value = 'Instance must have a description!';
      return;
    }

    if (props.modelValue === null) return;

    try {
      const instance = await instanceStore.value.updateInstance({
        id: props.modelValue?.id ?? -1,
        description: input.value,
      });

      update(instance);
      toggle();
    } catch (e) {
      if (e instanceof Error) {
        error.value = e.message;
      }
    }
  }

  if (modalState.value === ModalState.ACTIVE) {
    if (props.modelValue === null) return;

    try {
      const instance = await instanceStore.value.updateInstance({
        id: props.modelValue?.id ?? -1,
        isActive: true,
      });

      update(instance);
      toggle();
    } catch (e) {
      if (e instanceof Error) {
        error.value = e.message;
      }
    }
  }

  if (modalState.value === ModalState.DELETE) {
    if (props.modelValue === null) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await instanceStore.value.deleteInstance(props.modelValue!);
      update(null);
    } catch (e) {
      if (e instanceof Error) {
        error.value = e.message;
      }
    } finally {
      toggle();
    }
  }

  if (modalState.value === ModalState.INVITE_CODE) {
    toggle();
  }
}

// Reset the input and close the modal.
function handleCancel() {
  input.value = '';
  toggle();
}
</script>

<template>
  <v-select v-bind="{ ...props, ...$attrs }" @update:model-value="update">
    <template #activatorLabel>
      <template v-if="modelValue?.isActive ?? false">
        <span class="active">(Active)</span>
      </template>

      {{ modelValue?.description ?? 'Select instance...' }}
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

    <v-option
      :disabled="modelValue === null"
      @click="toggleDividendPostingModal"
    >
      Post Dividends...
    </v-option>

    <v-option :disabled="modelValue === null" @click="startInviteCode">
      Invite Code...
    </v-option>
  </v-select>

  <modal-dialog
    :title="modalTitle"
    :class="modalClass"
    :show="showModal"
    :cancel-label="modalCancelLabel"
    @ok="handleOk"
    @cancel="handleCancel"
  >
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

    <template v-else>
      <v-input v-model="input" name="instance-name" label="Name" required />
    </template>
  </modal-dialog>

  <!--<suspense>
    <dividend-posting-modal
      :show="showDividendPostingModal"
      :store="store"
      :instance="modelValue"
      @ok="toggleDividendPostingModal"
    />
  </suspense>-->
</template>

<style scoped>
span.active {
  font-size: 0.7em;
  vertical-align: middle;
}
</style>
