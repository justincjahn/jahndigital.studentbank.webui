<template>
  <base-select
    :options="options"
    :value="value"
    :model-value="modelValue"
    prompt="Select an instance..."
    @update:modelValue="update"
  >
    <template #selected="{ option, prompt }">
      <template v-if="option?.isActive ?? false">
        <span class="active">(Active)</span> {{ option.description }}
      </template>
      <template v-else>
        {{ option?.description ?? prompt }}
      </template>
    </template>
    <template #list="{ options, className, select }">
      <li
        v-for="option in options"
        :key="option.id"
        :class="className"
        @click="select(option)"
      >
        <template v-if="option?.isActive ?? false">
          <span class="active">(Active)</span> {{ option.description }}
        </template>
        <template v-else>
          {{ option?.description ?? option }}
        </template>
      </li>
      <li class="select__items__divider">
        <hr />
      </li>
      <li
        :class="className"
        @click.prevent="startAdd"
      >
        Add...
      </li>
      <li
        :class="className"
        @click.prevent="startEdit"
      >
        Rename...
      </li>
      <li
        :class="className"
        @click.prevent="startDelete"
      >
        Delete...
      </li>
      <li
        :class="className"
        @click.prevent="startActive"
      >
        Activate...
      </li>
    </template>
  </base-select>

  <Modal
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
      <strong>Warning:</strong> Making this instance active will mark all other instances inactive.
      Students in inactive instances cannot log in.
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
  </Modal>
</template>

<script lang="ts">
import BaseSelect, { Search } from '@/components/BaseSelect.vue';
import Modal from '@/components/Modal.vue';
import errorStore from '@/store/error';
import theInstanceStore, { InstanceStore } from '@/store/instance';
import userStore from '@/store/user';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import uuid4 from '@/utils/uuid4';

export enum ModalState {
  ADD,
  EDIT,
  DELETE,
  ACTIVE,
}

/**
 * A component that allows users to select, add, rename, and delete an Instance. A custom
 * instanceStore may be passed in if using the global instanceStore is not desired.
 */
export default defineComponent({
  components: {
    BaseSelect,
    Modal,
  },
  props: {
    modelValue: {
      type: Object as PropType<Instance>,
      default: undefined,
    },
    instanceStore: {
      type: Object as PropType<InstanceStore>,
      default: undefined,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    // If the modal is open.
    const showModal = ref(false);

    // The input to add/rename an instance
    const input = ref('');

    // A unique ID for the form
    const id = uuid4();

    // The current state of the modal
    const modalState = ref<ModalState>(ModalState.ADD);

    // Use either the provided instanceStore or the global one.
    const instanceStore = computed(() => props.instanceStore ?? theInstanceStore);

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

      return 'Are you sure?';
    });

    // The class of the modal window
    const modalClass = computed(() => {
      if (modalState.value === ModalState.DELETE) {
        return 'destructive';
      }

      return null;
    });

    // Return the name of the group as the value
    const value: Search = (x) => (typeof x === 'object' ? x?.description ?? x : x);

    // Cascade the model update
    function update(item: Instance|null) { emit('update:modelValue', item); }

    // Open or close the New Instance form.
    function toggle() { showModal.value = !showModal.value; }

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
          errorStore.setCurrentError('Instance must have a description!');
          return;
        }

        try {
          const instance = await instanceStore.value.newInstance({ description: input.value });
          update(instance);
          toggle();
        } catch (e) {
          errorStore.setCurrentError(e?.message ?? e);
        }
      }

      if (modalState.value === ModalState.EDIT) {
        if (input.value.length < 3) {
          errorStore.setCurrentError('Instance must have a description!');
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
          errorStore.setCurrentError(e?.message ?? e);
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
          errorStore.setCurrentError(e?.message ?? e);
        }
      }

      if (modalState.value === ModalState.DELETE) {
        if (props.modelValue === null) return;

        try {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await instanceStore.value.deleteInstance(props.modelValue!);
          update(null);
        } catch (e) {
          errorStore.setCurrentError(e.message ?? e);
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

    // Fetch instances if there are none, or the user just authenticated
    watchEffect(() => {
      if (userStore.isAuthenticated.value || instanceStore.value.instances.value.length === 0) {
        instanceStore.value.fetchInstances();
      }
    });

    return {
      ModalState,
      options: instanceStore.value.instances,
      modalTitle,
      modalClass,
      modalState,
      showModal,
      startActive,
      startAdd,
      startEdit,
      startDelete,
      handleOk,
      handleCancel,
      input,
      update,
      value,
      id,
    };
  },
});
</script>

<style lang="scss" scoped>
  span.active {
    font-size: 0.7em;
    vertical-align: middle;
  }

  .instance-form {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
</style>
