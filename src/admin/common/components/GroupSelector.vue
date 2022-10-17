<script lang="ts" setup>
import { computed, ref } from 'vue';

// Types
import type { Group as ServiceGroup } from '@/admin/common/services/group';
import type { GlobalStore } from '@/admin/common/stores/global';

// Components
import { VOption, VDivider, VSelect, VInput } from '@/common/components/inputs';
import ModalDialog from '@/common/components/ModalDialog.vue';

type Group = ServiceGroup | null;

enum ModalState {
  ADD,
  EDIT,
  DELETE,
}

const props = withDefaults(
  defineProps<{
    modelValue: Group;

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
    prompt: 'Choose a group...',
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
  (event: 'update:modelValue', value: Group): void;
}>();

const error = computed({
  get() {
    return props.store.error.error.value;
  },

  set(val: string | null) {
    props.store.error.setCurrentError(val);
  },
});

const groupStore = computed(() => props.store.group);

const instanceId = computed(() => props.store.instance.selected.value?.id);

const options = computed(() => groupStore.value.groups.value);

const input = ref('');

const modalShown = ref(false);

const modalState = ref(ModalState.ADD);

const modalTitle = computed(() => {
  switch (modalState.value) {
    case ModalState.ADD:
      return 'Create a Group';
    case ModalState.EDIT:
      return 'Rename a Group';
    default:
      return 'Are you sure?';
  }
});

const modalClass = computed(() => {
  if (modalState.value === ModalState.DELETE) {
    return 'destructive';
  }

  return null;
});

function modalToggle() {
  modalShown.value = !modalShown.value;
}

function handleUpdate(item: unknown) {
  emit('update:modelValue', item as Group);
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
  if (!props.modelValue) return;
  modalState.value = ModalState.DELETE;
  modalToggle();
}

async function handleModalOk() {
  if (modalState.value === ModalState.ADD) {
    if (!instanceId.value) return;

    try {
      const group = await groupStore.value.create({
        instanceId: instanceId.value,
        name: input.value,
      });

      handleUpdate(group);
      modalToggle();
    } catch (e) {
      if (!(e instanceof Error)) return;
      error.value = e.message;
    }
  }

  if (modalState.value === ModalState.EDIT) {
    if (!props.modelValue) return;

    try {
      const group = await groupStore.value.update({
        id: props.modelValue.id,
        name: input.value,
      });

      handleUpdate(group);
      modalToggle();
    } catch (e) {
      if (!(e instanceof Error)) return;
      error.value = e.message;
    }
  }

  if (modalState.value === ModalState.DELETE) {
    if (!props.modelValue) return;

    try {
      await groupStore.value.remove(props.modelValue);
      handleUpdate(null);
    } catch (e) {
      if (!(e instanceof Error)) return;
      error.value = e.message;
    } finally {
      modalToggle();
    }
  }
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

    <v-option @click="startAdd">Add...</v-option>

    <v-option :disabled="modelValue === null" @click="startEdit">
      Rename...
    </v-option>

    <v-option :disabled="modelValue === null" @click="startDelete">
      Delete...
    </v-option>
  </v-select>

  <modal-dialog
    :title="modalTitle"
    :class="modalClass"
    :show="modalShown"
    cancel-label="Cancel"
    @ok="handleModalOk"
    @cancel="handleModalCancel"
  >
    <template v-if="modalState === ModalState.DELETE">
      This action cannot be undone!
    </template>

    <template v-else>
      <v-input v-model="input" name="group-name" label="Name" required />
    </template>
  </modal-dialog>
</template>
