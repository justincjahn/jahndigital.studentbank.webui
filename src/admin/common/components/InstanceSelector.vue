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
import BaseSelect, { Search } from '@/common/components/inputs/BaseSelect.vue';
import ModalDialog from '@/common/components/ModalDialog.vue';

type Instance = ServiceInstance | null;

// @TODO: Fix this.
// const DividendPostingModal = defineAsyncComponent(() => import('./DividendPostingModal.vue'));

enum ModalState {
  ADD,
  EDIT,
  DELETE,
  ACTIVE,
  POST_DIVIDENDS,
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

// An object of additional options and indexes added to the base select component
const indexes = computed(() => ({
  ADD: options.value.length,
  RENAME: options.value.length + 1,
  DELETE: options.value.length + 2,
  ACTIVATE: options.value.length + 3,
  POST_DIVIDENDS: options.value.length + 4,
  INVITE_CODE: options.value.length + 5,
}));

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

// Return the name of the instance as the value
const value: Search = (x) =>
  typeof x === 'object'
    ? (x as Instance)?.description ?? 'UNKNOWN'
    : x?.toString() ?? 'UNKNOWN';

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

// Handle the selection of additional options
function handleSelect(index: number) {
  switch (index) {
    case indexes.value.ADD:
      startAdd();
      break;
    case indexes.value.RENAME:
      startEdit();
      break;
    case indexes.value.DELETE:
      startDelete();
      break;
    case indexes.value.ACTIVATE:
      startActive();
      break;
    case indexes.value.POST_DIVIDENDS:
      toggleDividendPostingModal();
      break;
    case indexes.value.INVITE_CODE:
      startInviteCode();
      break;
    default:
    // Ignore
  }
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
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events -->
  <!-- eslint-disable vuejs-accessibility/mouse-events-have-key-events -->

  <base-select
    prompt="Select an instance..."
    class="instance-selector"
    v-bind="$attrs"
    :options="options"
    :value="value"
    :model-value="modelValue"
    @update:model-value="update"
    @select="handleSelect"
  >
    <template #selected="{ option, prompt }">
      <template v-if="(option as Instance)?.isActive ?? false">
        <span class="active">(Active)</span>
        {{ (option as Instance)?.description }}
      </template>
      <template v-else>
        {{ (option as Instance)?.description ?? prompt }}
      </template>
    </template>

    <template #option="{ option }">
      <template v-if="(option as Instance)?.isActive ?? false">
        <span class="active">(Active)</span>
        {{ (option as Instance)?.description }}
      </template>
      <template v-else>
        {{ (option as Instance)?.description }}
      </template>
    </template>

    <template #additionalItems="{ select, classes, enter }">
      <li class="select__items__divider"><hr /></li>

      <li
        :class="classes(indexes.ADD)"
        @click="select(indexes.ADD)"
        @mouseenter="enter(indexes.ADD)"
      >
        Add...
      </li>

      <li
        :class="classes(indexes.RENAME)"
        @click="select(indexes.RENAME)"
        @mouseenter="enter(indexes.RENAME)"
      >
        Rename...
      </li>

      <li
        :class="classes(indexes.DELETE)"
        @click="select(indexes.DELETE)"
        @mouseenter="enter(indexes.DELETE)"
      >
        Delete...
      </li>

      <li
        :class="classes(indexes.ACTIVATE)"
        @click="select(indexes.ACTIVATE)"
        @mouseenter="enter(indexes.ACTIVATE)"
      >
        Activate...
      </li>

      <li class="select__items__divider"><hr /></li>

      <li
        :class="classes(indexes.POST_DIVIDENDS)"
        @click="select(indexes.POST_DIVIDENDS)"
        @mouseenter="enter(indexes.POST_DIVIDENDS)"
      >
        Post Dividends...
      </li>

      <li
        :class="classes(indexes.INVITE_CODE)"
        @click="select(indexes.INVITE_CODE)"
        @mouseenter="enter(indexes.INVITE_CODE)"
      >
        Invite Code...
      </li>
    </template>
  </base-select>

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
