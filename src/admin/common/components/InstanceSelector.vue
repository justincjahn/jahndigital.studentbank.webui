<script lang="ts" setup>
import { computed, ref } from 'vue';

// Common
import type { Instance as ServiceInstance } from '@/admin/common/services/instance';
import { BASE_URLS } from '@/common/constants';

// Utils
import uuid4 from '@/common/utils/uuid4';

// Stores
import { GlobalStore } from '@/admin/common/stores/global';

// Components
import { VOption, VDivider, VSelect } from '@/common/components/inputs/select';
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

const props = defineProps<{
  modelValue: Instance;
  store: GlobalStore;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: Instance): void;
}>();

const error = computed({
  get() {
    return props.store.error.error.value;
  },

  set(val: string | null) {
    props.store.error.setCurrentError(val);
  },
});

const instanceStore = computed(() => props.store.instance);

// If the modal is open.
const showModal = ref(false);

// If the dividend posting modal is open.
const showDividendPostingModal = ref(false);

// The input to add/rename an instance
const input = ref('');

// A unique ID for the form
const id = uuid4();

// The current state of the modal
const modalState = ref<ModalState>(ModalState.ADD);

// The array of options presented to the base select component
const options = computed(() => instanceStore.value.instances.value);

// The current invite code
const inviteCode = computed(
  () => instanceStore.value.selected.value?.inviteCode ?? 'UNKNOWN'
);

// The input element containing the invite code
const inviteCodeInput = ref<HTMLInputElement | null>(null);

// URL to send to students
const inviteUrl = computed(() => {
  const baseUrl = `${window.location.protocol}//${window.location.host}/${BASE_URLS.REGISTER}?i=${inviteCode.value}`;
  return baseUrl;
});

// The input element containing the invite code url
const inviteCodeUrlInput = ref<HTMLInputElement | null>(null);

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

// Copy the invite code to the clipboard
function copyInviteCode() {
  if (!inviteCodeInput.value) return;
  inviteCodeInput.value.select();
  inviteCodeInput.value.setSelectionRange(0, 100);
  document.execCommand('copy');
}

// Copy the invite code to the clipboard
function copyInviteCodeUrl() {
  if (!inviteCodeUrlInput.value) return;
  inviteCodeUrlInput.value.select();
  inviteCodeUrlInput.value.setSelectionRange(0, 1000);
  document.execCommand('copy');
}

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
}

// Reset the input and close the modal.
function handleCancel() {
  input.value = '';
  toggle();
}
</script>

<template>
  <v-select :model-value="modelValue" @update:model-value="update">
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
    cancel-label="Cancel"
    @ok.prevent="handleOk"
    @cancel.prevent="handleCancel"
  >
    <template v-if="modalState === ModalState.DELETE">
      This action cannot be undone!
    </template>

    <template v-else-if="modalState === ModalState.ACTIVE">
      <strong>Warning:</strong> Making this instance active will mark all other
      instances inactive. Students in inactive instances cannot log in.
    </template>

    <template v-else-if="modalState === ModalState.INVITE_CODE">
      <div class="instance-form instance-form--invite-code">
        <label :for="`instance-form__invite-url--${id}`">Invite Code URL</label>

        <div class="instance-form--input-wrapper">
          <input
            :id="`instance-form__invite-url--${id}`"
            ref="inviteCodeUrlInput"
            type="text"
            readonly
            :value="inviteUrl"
            @focus="($event.target as HTMLInputElement).select()"
          />

          <button type="button" class="secondary" @click="copyInviteCodeUrl">
            Copy
          </button>
        </div>

        <label :for="`instance-form__invite-code--${id}`">Invite Code</label>

        <div class="instance-form--input-wrapper">
          <input
            :id="`instance-form__invite-code--${id}`"
            ref="inviteCodeInput"
            type="text"
            readonly
            :value="inviteCode"
            @focus="($event.target as HTMLInputElement).select()"
          />

          <button type="button" class="secondary" @click="copyInviteCode">
            Copy
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="instance-form">
        <label :for="`instance-form__instance-name--${id}`">Name</label>
        <input
          :id="`instance-form__instance-name--${id}`"
          ref="inputElement"
          v-model="input"
          type="text"
        />
      </div>
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

.instance-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.instance-form--input-wrapper {
  display: flex;
  flex-direction: row;
}

.instance-form--input-wrapper button {
  margin: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.instance-form--input-wrapper input {
  flex-grow: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
