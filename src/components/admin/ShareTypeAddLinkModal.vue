<template>
  <Modal
    title="Add and Link Share Types"
    okLabel="Close"
    customClass="large"
    okButtonClass=""
    :show="show"
    @ok.prevent="handleOk"
    @cancel.prevent="handleOk"
    :handleEnter="false"
  >
    <form class="stf" @submit.prevent="handleAdd">
      <div class="stf__fieldset stf__fieldset--name">
        <label :for="`stf__fieldset--name--${id}`">Name<span class="required">*</span></label>
        <input type="text" :id="`stf__fieldset--name--${id}`" v-model="nameValue" />
        <p class="error" v-if="nameError">{{nameError}}</p>
      </div>
      <div class="stf__fieldset stf__fieldset--rate">
        <label :for="`stf__fieldset--rate--${id}`">Dividend Rate<span class="required">*</span></label>
        <p class="help-text">Specify the dividend rate in percent.</p>
        <div class="stf__fieldset--adorner">
          <input type="text" :id="`stf__fieldset--rate--${id}`" v-model="rateValue" />
          <span class="stf__fieldset--adorner--adornment">%</span>
        </div>
        <p class="error" v-if="rateError">{{rateError}}</p>
      </div>
      <button type="submit" class="primary" :disabled="addLoading || !canAdd">
        <loading-icon :show="addLoading">
          <template v-if="addLoading">Adding...</template>
          <template v-else>Add</template>
        </loading-icon>
      </button>
    </form>

    <div class="stl">
      <share-type-multiselect
        :shareTypes="shareTypes"
        :loading="loading"
        v-model="selected"
        prompt="Use the form above to add a new Share Type, and link it here."
      />

      <button
        class="stl__button primary"
        :disabled="!canLink"
        @click.prevent="handleLink"
      >
        Link Selected
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue';
import { useField } from 'vee-validate';
import errorStore from '@/store/error';
import instanceStore from '@/store/instance';
import theShareTypeStore, { setup as setupShareTypeStore } from '@/store/shareType';
import Modal from '@/components/Modal.vue';
import LoadingIcon from '@/components/LoadingIcon.vue';
import ShareTypeMultiselect from '@/components/ShareTypeMultiselector.vue';
import uuid4 from '@/utils/uuid4';
import Rate from '@/utils/rate';

/**
 * Allows users to create new Share Types and then link them to the currently selected
 * instance.  Updates the global shareTypeStore to ensure the new share type(s) are valid.
 */
export default defineComponent({
  components: {
    Modal,
    LoadingIcon,
    ShareTypeMultiselect,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'ok',
  ],
  setup(props, { emit }) {
    // Use a bespoke ShareTypeStore for the available share types list so we don't muddle global state.
    const shareTypeStore = setupShareTypeStore(instanceStore, false);

    // True if a share type add operation is awaiting the server.
    const addLoading = ref(false);

    // An array of selected share types
    const selected = ref<ShareType[]>([]);

    // A unique ID for the form elements
    const id = uuid4();

    // Filter share types that are already in the selected instance
    const shareTypes = computed(() => {
      const instanceId = shareTypeStore.instanceStore.selected?.value?.id ?? -1;
      const filtered = shareTypeStore.shareTypes.value.filter((st) => {
        const hasInstance = st.shareTypeInstances.find((instance) => instance.instanceId === instanceId);
        return !hasInstance;
      });

      return filtered;
    });

    // Ensures that the share type's name is valid
    function validateName(val: string): string|boolean {
      if (val && val.trim()) return true;
      return 'Name is required.';
    }

    // Ensures that the rate is valid
    function validateRate(val: string): string|boolean {
      if (!val || !val.trim()) return 'Rate is required.';

      try {
        Rate.fromString(`${val}%`);
      } catch (e) {
        return e.message;
      }

      return true;
    }

    // The share type's name
    const {
      value: nameValue,
      errorMessage: nameError,
      handleReset: nameReset,
      validate: nameValidate,
    } = useField('name', validateName, {
      validateOnMount: true,
      initialValue: '',
    });

    // The dividend rate
    const { value: rateValue, errorMessage: rateError, handleReset: rateReset } = useField('rate', validateRate, {
      initialValue: '0',
    });

    // Reset the form back to defaults
    function reset() {
      nameReset();
      rateReset();
      nameValidate();
    }

    // True if the add button should be enabled
    const canAdd = computed(() => !(nameError.value || rateError.value));

    // True if the link button should be enabled
    const canLink = computed(() => selected.value.length > 0);

    // Tell the parent to close the modal
    function handleOk() { reset(); emit('ok'); }

    // Fetch a list of available share types using our custom store.
    async function fetchAvailableShareTypes() { await shareTypeStore.fetch({ available: true }); }

    // Link the selected share types
    async function handleLink() {
      if (!theShareTypeStore.instanceStore.selected.value) return;
      const instanceId = theShareTypeStore.instanceStore.selected.value.id;
      const errors = [] as string[];

      await Promise.all(selected.value.map(async (shareType) => {
        try {
          await theShareTypeStore.linkShareType({
            shareTypeId: shareType.id,
            instanceId,
          });
        } catch (e) {
          errors.push(e?.message ?? e);
        }
      }));

      if (errors.length > 0) {
        errorStore.setCurrentError(errors.join(', '));
      }

      await theShareTypeStore.fetch();
      await fetchAvailableShareTypes();
    }

    // Add a new share type and refresh available share types
    async function handleAdd() {
      addLoading.value = true;

      try {
        await shareTypeStore.newShareType({
          name: nameValue.value,
          dividendRate: Rate.fromString(`${rateValue.value}%`).getRate(),
        });

        reset();
        await fetchAvailableShareTypes();
      } catch (e) {
        errorStore.setCurrentError('Unable to add the Share Type.  Does it already exist?');
        console.error(e);
      } finally {
        addLoading.value = false;
      }
    }

    // Perform initial fetch of available share types on show
    watchEffect(() => {
      if (props.show === true) fetchAvailableShareTypes();
    });

    return {
      selected,
      shareTypes,
      loading: shareTypeStore.loading,
      addLoading,
      handleOk,
      handleAdd,
      handleLink,
      canAdd,
      canLink,
      nameValue,
      nameError,
      rateValue,
      rateError,
      id,
    };
  },
});
</script>

<style lang="scss" scoped>
$size: 35rem;

.stf {
  @include round-border();

  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: $size;
  margin: 0px auto;
  padding: 1em;

  &__fieldset input {
    width: 100%;
  }

  & button {
    font-size: 1em;
    margin: 0;
  }

  &__fieldset--rate {
    & .stf__fieldset--adorner {
      position: relative;

      &--adornment {
        position: absolute;
        right: 1ch;
        top: 0.25em;
        user-select: none;
        opacity: 0.6;
      }
    }
  }
}

.stl {
  margin-top: 1em;
  display: flex;
  flex-direction: column;
  max-width: $size;
  margin: 1em auto 0em auto;

  &__button.primary {
    align-self: flex-end;
    width: 100%;
    margin: 0.5em 0 0 0;
  }
}
</style>
