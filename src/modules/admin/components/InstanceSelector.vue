<template>
  <base-select
    prompt="Select an instance..."
    class="instance-selector"
    v-bind="$attrs"
    :options="options"
    :value="value"
    :model-value="modelValue"
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
    <template #list="{ options, className, select, selected }">
      <li
        v-for="option in options"
        :key="option.id"
        :class="[className, selected(option)]"
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
      <li class="select__items__divider">
        <hr />
      </li>
      <li
        :class="className"
        @click.prevent="toggleDividendPostingModal"
      >
        Post Dividends...
      </li>
      <li
        :class="className"
        @click.prevent="startInviteCode"
      >
        Invite Code...
      </li>
    </template>
  </base-select>

  <modal
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
    <template v-else-if="modalState === ModalState.INVITE_CODE">
      <div class="instance-form instance-form--invite-code">
        <label :for="`instance-form__invite-url--${id}`">Invite Code URL</label>

        <div class="instance-form--input-wrapper">
          <input
            :id="`instance-form__invite-url--${id}`"
            ref="inviteCodeUrlInput"
            type="text"
            readonly="readonly"
            :value="inviteUrl"
            @focus="$event.target.select()"
          />

          <button
            type="button"
            class="secondary"
            @click="copyInviteCodeUrl"
          >
            Copy
          </button>
        </div>

        <label :for="`instance-form__invite-code--${id}`">Invite Code</label>

        <div class="instance-form--input-wrapper">
          <input
            :id="`instance-form__invite-code--${id}`"
            ref="inviteCodeInput"
            type="text"
            readonly="readonly"
            :value="inviteCode"
            @focus="$event.target.select()"
          />

          <button
            type="button"
            class="secondary"
            @click="copyInviteCode"
          >
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
  </modal>

  <suspense>
    <dividend-posting-modal
      :show="showDividendPostingModal"
      :share-type-store="shareTypeStore"
      :instance="modelValue"
      @ok="toggleDividendPostingModal"
    />
  </suspense>
</template>

<script lang="ts">
import { BASE_URLS } from '@/constants';
import { computed, defineAsyncComponent, defineComponent, PropType, ref } from 'vue';

// Components
import BaseSelect, { Search } from '@/components/BaseSelect.vue';
import Modal from '@/components/Modal.vue';

// Stores
import errorStore from '@/store/error';
import { InstanceStore } from '@/modules/admin/stores/instance';
import { setup as defineShareTypeStore } from '@/modules/admin/stores/shareType';

// Utils
import uuid4 from '@/utils/uuid4';

export enum ModalState {
  ADD,
  EDIT,
  DELETE,
  ACTIVE,
  INVITE_CODE,
}

/**
 * A component that allows users to select, add, rename, and delete an Instance. A custom
 * instanceStore may be passed in if using the global instanceStore is not desired.
 */
export default defineComponent({
  components: {
    BaseSelect,
    Modal,
    DividendPostingModal: defineAsyncComponent(() => import('./DividendPostingModal.vue')),
  },
  props: {
    modelValue: {
      type: Object as PropType<Instance>,
      default: undefined,
    },
    instanceStore: {
      type: Object as PropType<InstanceStore>,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
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

    // The current invite code
    const inviteCode = computed(() => props.instanceStore.selected.value?.inviteCode ?? 'UNKNOWN');

    // The input element containing the invite code
    const inviteCodeInput = ref<HTMLInputElement|null>(null);

    // URL to send to students
    const inviteUrl = computed(() => {
      const baseUrl = `${window.location.protocol}://${window.location.host}/${BASE_URLS.REGISTER}?i=${inviteCode.value}`;
      return baseUrl;
    });

    // The input element containing the invite code url
    const inviteCodeUrlInput = ref<HTMLInputElement|null>(null);

    // The ShareTypeStore used to post dividends
    const shareTypeStore = defineShareTypeStore(props.instanceStore);

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

    // Return the name of the group as the value
    const value: Search = (x) => (typeof x === 'object' ? x?.description ?? x : x);

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
    function update(item: Instance|null) { emit('update:modelValue', item); }

    // Open or close the New Instance form.
    function toggle() { showModal.value = !showModal.value; }

    // Open or close the Dividend Posting Modal
    function toggleDividendPostingModal() { showDividendPostingModal.value = !showDividendPostingModal.value; }

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
          errorStore.setCurrentError('Instance must have a description!');
          return;
        }

        try {
          const instance = await props.instanceStore.newInstance({ description: input.value });
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
          const instance = await props.instanceStore.updateInstance({
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
          const instance = await props.instanceStore.updateInstance({
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
          await props.instanceStore.deleteInstance(props.modelValue!);
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

    return {
      showDividendPostingModal,
      ModalState,
      shareTypeStore,
      options: props.instanceStore.instances,
      copyInviteCode,
      inviteCode,
      inviteCodeInput,
      inviteUrl,
      inviteCodeUrlInput,
      copyInviteCodeUrl,
      modalTitle,
      modalClass,
      modalState,
      showModal,
      toggleDividendPostingModal,
      startInviteCode,
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

    &--input-wrapper {
      display: flex;
      flex-direction: row;

      button {
        margin: 0;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      input {
        flex-grow: 1;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }
</style>
