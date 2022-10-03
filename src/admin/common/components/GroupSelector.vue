<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue';

// Types
import type { Group as ServiceGroup } from '@/admin/common/services/group';
import type { GlobalStore } from '@/admin/common/stores/global';

// Components
import { VOption, VDivider, VSelect, VInput } from '@/common/components/inputs';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

type Group = ServiceGroup | null;

enum ModalState {
  ADD,
  EDIT,
  DELETE,
}

const props = defineProps<{
  modelValue: Group;
  store: GlobalStore;
}>();

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

const options = computed(() => groupStore.value.groups.value);

const input = ref('');

const modalShown = ref(false);

const modalState = ref(ModalState.ADD);

const modalTitle = computed(() => {
  if (modalState.value === ModalState.ADD) {
    return 'Create a Group';
  }

  if (modalState.value === ModalState.EDIT) {
    return 'Edit Group';
  }

  return 'Delete Group';
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
    if (!props.store.instance.selected.value) return;

    try {
      const group = await groupStore.value.newGroup({
        instanceId: props.store.instance.selected.value,
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
    if (!props.store.instance.selected.value) return;

    try {
      const group = await groupStore.value.updateGroup({
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
      await groupStore.value.deleteGroup(props.modelValue);
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
  <v-select
    :model-value="modelValue"
    prompt="Select group..."
    @update:model-value="handleUpdate"
  >
    <template #activatorLabel="{ prompt }">
      {{ modelValue?.name ?? prompt }}
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
    <v-input v-model="input" name="group-name" label="Name" required />
  </modal-dialog>
</template>
