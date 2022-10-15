<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import type { ShareType as ServiceShareType } from '@/admin/common/services/shareType';
import type { GlobalStore } from '@/admin/common/stores/global';
import { VSelect, VOption, VDivider } from '@/common/components/inputs';
import Rate from '@/common/utils/Rate';
import Money from '@/common/utils/Money';
import { buildFormData } from './useShareTypeForm';
import ShareTypeAddEditForm from './ShareTypeAddEditForm.vue';
import ShareTypeSelectorAddLinkModal from './ShareTypeSelectorAddLinkModal.vue';

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

    // The store to use for querying and state
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

// const error = computed({
//   get: () => props.store.error.error.value,
//   set: (value: string | null) => props.store.error.setCurrentError(value),
// });

const shareTypeStore = computed(() => props.store.shareType);

const options = computed(() => shareTypeStore.value.shareTypes.value);

const formValid = ref(false);

const formData = buildFormData();

const modalShown = ref(false);

const modalState = ref(ModalState.ADD);

const modalFormValid = computed(() => {
  if (modalState.value === ModalState.EDIT) {
    return formValid.value && !shareTypeStore.value.loading.value;
  }

  return !shareTypeStore.value.loading.value;
});

const modalTitle = computed(() => {
  if (modalState.value === ModalState.ADD) {
    return 'Create and Link Share Types';
  }

  if (modalState.value === ModalState.EDIT) {
    return 'Edit Share Type';
  }

  return 'Remove and Unlink Share Types';
});

const modalOkLabel = computed(() => {
  if (
    modalState.value === ModalState.ADD ||
    modalState.value === ModalState.DELETE
  ) {
    return 'Close';
  }

  return 'Save';
});

const modalCancelLabel = computed(() => {
  if (modalState.value === ModalState.EDIT) {
    return 'Cancel';
  }

  return undefined;
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
  modalState.value = ModalState.ADD;
  modalToggle();
}

function startEdit() {
  if (!props.modelValue) return;
  modalState.value = ModalState.EDIT;
  modalToggle();
}

function startDelete() {
  modalState.value = ModalState.DELETE;
  modalToggle();
}

async function handleModalOk() {
  if (!modalFormValid.value) return;

  if (modalState.value === ModalState.EDIT) {
    try {
      await props.store.shareType.update({
        id: formData.id,
        name: formData.name,
        dividendRate: Rate.fromStringOrDefault(formData.dividendRate).getRate(),
        withdrawalLimitCount: +formData.withdrawalLimitCount,
        withdrawalLimitShouldFee: formData.withdrawalLimitShouldFee,
        withdrawalLimitPeriod: formData.withdrawalLimitPeriod,
        withdrawalLimitFee: Money.fromStringOrDefault(
          formData.withdrawalLimitFee
        ).getAmount(),
      });

      modalToggle();
    } catch (e) {
      if (!(e instanceof Error)) return;
      props.store.error.setCurrentError(e.message);
    }
  } else {
    modalToggle();
  }
}

function handleModalCancel() {
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
    :class="modalClass"
    :title="modalTitle"
    :show="modalShown"
    :ok-label="modalOkLabel"
    :cancel-label="modalCancelLabel"
    :handle-enter="modalState === ModalState.EDIT"
    :can-submit="modalFormValid"
    @ok="handleModalOk"
    @cancel="handleModalCancel"
  >
    <div v-if="modalState === ModalState.ADD">
      <share-type-selector-add-link-modal
        v-model:valid="formValid"
        :selected="modelValue"
        :store="props.store"
        :show="modalState == ModalState.ADD"
      />
    </div>

    <form v-if="modalState === ModalState.EDIT" @submit.prevent="handleModalOk">
      <share-type-add-edit-form
        v-model="formData"
        v-model:valid="formValid"
        :selected="modelValue"
      />
    </form>
  </modal-dialog>
</template>
