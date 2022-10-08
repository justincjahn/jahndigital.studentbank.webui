<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import type { ShareType as ServiceShareType } from '@/admin/common/services/shareType';
import type { GlobalStore } from '@/admin/common/stores/global';
import { VSelect, VOption, VDivider } from '@/common/components/inputs';
import { buildFormData } from './useShareTypeForm';
import ShareTypeAddEditForm from './ShareTypeAddEditForm.vue';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

type ShareType = ServiceShareType | null;

enum ModalState {
  ADD,
  EDIT,
  DELETE,
}

const props = withDefaults(
  defineProps<{
    modelValue: ShareType;

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
    name: undefined,
    id: undefined,
    prompt: 'Choose a Share Type...',
    label: undefined,
    helpText: undefined,
    width: undefined,
    disabled: undefined,
    required: undefined,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: ShareType): void;
}>();

const formData = buildFormData();

const formValid = ref(false);

// const error = computed({
//   get: () => props.store.error.error.value,
//   set: (value: string | null) => props.store.error.setCurrentError(value),
// });

const shareTypeStore = computed(() => props.store.shareType);

const options = computed(() => shareTypeStore.value.shareTypes.value);

const input = ref('');

const modalShown = ref(false);

const modalState = ref(ModalState.ADD);

const modalFormValid = computed(() => {
  if (
    modalState.value === ModalState.ADD ||
    modalState.value === ModalState.EDIT
  ) {
    return formValid.value && !shareTypeStore.value.loading.value;
  }

  return !shareTypeStore.value.loading.value;
});

const modalFormCanCancel = computed(() => {
  return !shareTypeStore.value.loading.value;
});

const modalTitle = computed(() => {
  if (modalState.value === ModalState.ADD) {
    return 'Create and Link';
  }

  if (modalState.value === ModalState.EDIT) {
    return 'Edit';
  }

  return 'Remove and Unlink';
});

const modalClass = computed(() => ({
  large: true,
  destructive: modalState.value === ModalState.DELETE,
}));

function handleUpdate(item: unknown) {
  emit('update:modelValue', item as ShareType);
}

function modalToggle() {
  modalShown.value = !modalShown.value;
}

function startAdd() {
  input.value = '';
  modalState.value = ModalState.ADD;
  modalToggle();
}

function startEdit() {
  if (!props.modelValue) return;
  input.value = props.modelValue.name;
  modalState.value = ModalState.EDIT;
  modalToggle();
}

function startDelete() {
  input.value = '';
  modalState.value = ModalState.DELETE;
  modalToggle();
}

function handleModalOk() {
  if (!modalFormValid.value) return;
  modalToggle();
}

function handleModalCancel() {
  input.value = '';
  modalToggle();
}
</script>

<template>
  <v-select v-bind="{ ...props, ...$attrs }" @update:model-value="handleUpdate">
    <template #activatorLabel="{ prompt: promptText }">
      {{ modelValue?.name ?? promptText }}
    </template>

    <v-option v-for="option in options" :key="option.id" :value="option">
      {{ option.name }}
    </v-option>

    <v-divider />

    <v-option @click="startAdd">Add....</v-option>

    <v-option :disabled="modelValue === null" @click="startEdit">
      Edit...
    </v-option>

    <v-option :disabled="modelValue === null" @click="startDelete">
      Delete...
    </v-option>
  </v-select>

  <modal-dialog
    cancel-label="Cancel"
    :class="modalClass"
    :title="modalTitle"
    :show="modalShown"
    :can-submit="modalFormValid"
    :can-cancel="modalFormCanCancel"
    @ok="handleModalOk"
    @cancel="handleModalCancel"
  >
    <div v-if="modalState === ModalState.ADD || modalState === ModalState.EDIT">
      <share-type-add-edit-form
        v-model="formData"
        v-model:is-valid="formValid"
        :share-type="modalState === ModalState.EDIT ? modelValue : null"
      />
    </div>
  </modal-dialog>
</template>
