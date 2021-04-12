<template>
  <Modal
    title="Add and Link Share Types"
    ok-label="Close"
    class="large"
    ok-button-class=""
    :show="show"
    :handle-enter="false"
    @ok="handleOk"
    @cancel="handleOk"
  >
    <form
      class="stf"
      @submit="handleAdd"
    >
      <div class="stf__fieldset stf__fieldset--name">
        <label :for="`stf__fieldset--name--${id}`">Name<span class="required">*</span></label>
        <Field
          :id="`stf__fieldset--name--${id}`"
          name="name"
          type="text"
        />
        <p
          v-if="formErrors['name']"
          class="error"
        >
          {{ formErrors['name'] }}
        </p>
      </div>
      <div class="stf__fieldset stf__fieldset--rate">
        <label :for="`stf__fieldset--rate--${id}`">Dividend Rate<span class="required">*</span></label>
        <p class="help-text">
          Specify the dividend rate in percent.
        </p>
        <div class="stf__fieldset--adorner">
          <Field
            :id="`stf__fieldset--rate--${id}`"
            name="rate"
            type="text"
          />
          <span class="stf__fieldset--adorner--adornment">%</span>
        </div>
        <p
          v-if="formErrors['rate']"
          class="error"
        >
          {{ formErrors['rate'] }}
        </p>
      </div>
      <button
        type="submit"
        class="primary"
        :disabled="addLoading || !canAdd"
      >
        <loading-icon :show="addLoading">
          <template v-if="addLoading">
            Adding...
          </template>
          <template v-else>
            Add
          </template>
        </loading-icon>
      </button>
    </form>

    <div class="stl">
      <share-type-multiselect
        v-model="selected"
        :share-types="shareTypes"
        :loading="loading"
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
import { defineComponent, ref, computed, watchEffect, PropType } from 'vue';
import { useForm, Field } from 'vee-validate';
import errorStore from '@/store/error';
import { setup as setupShareTypeStore, ShareTypeStore } from '@/store/shareType';
import Modal from '@/components/Modal.vue';
import LoadingIcon from '@/components/LoadingIcon.vue';
import ShareTypeMultiselect from '@/components/ShareTypeMultiselector.vue';
import uuid4 from '@/utils/uuid4';
import Rate from '@/utils/rate';

interface NewShareTypeForm {
  name: string;
  rate: string;
}

/**
 * Allows users to create new Share Types and then link them to the currently selected
 * instance.  Updates the global shareTypeStore to ensure the new share type(s) are valid.
 */
export default defineComponent({
  components: {
    Modal,
    Field,
    LoadingIcon,
    ShareTypeMultiselect,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    shareTypeStore: {
      type: Object as PropType<ShareTypeStore>,
      required: true,
    },
  },
  emits: [
    'ok',
  ],
  setup(props, { emit }) {
    // Use a bespoke ShareTypeStore for the available share types list so we don't muddle global state.
    const shareTypeStore = setupShareTypeStore(props.shareTypeStore.instanceStore, false);

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

    // Configure a form for vee-validate and hook up validation
    const {
      handleSubmit,
      errors: formErrors,
      resetForm,
      validate,
      values,
    } = useForm<NewShareTypeForm>({
      validationSchema: {
        name: validateName,
        rate: validateRate,
      },
      initialValues: {
        name: '',
        rate: '0',
      },
      validateOnMount: true,
    });

    // Reset the form back to defaults
    function reset() {
      resetForm();
      validate();
    }

    // True if the add button should be enabled
    const canAdd = computed(() => !(formErrors.value.name || formErrors.value.rate));

    // True if the link button should be enabled
    const canLink = computed(() => selected.value.length > 0);

    // Tell the parent to close the modal
    function handleOk() { reset(); emit('ok'); }

    // Fetch a list of available share types using our custom store.
    async function fetchAvailableShareTypes() { await shareTypeStore.fetch({ available: true }); }

    // Add a new share type and refresh available share types
    const handleAdd = handleSubmit(async () => {
      addLoading.value = true;

      try {
        await shareTypeStore.newShareType({
          name: values.name,
          dividendRate: Rate.fromString(`${values.rate}%`).getRate(),
        });

        reset();
        await fetchAvailableShareTypes();
      } catch (e) {
        errorStore.setCurrentError('Unable to add the Share Type.  Does it already exist?');
      } finally {
        addLoading.value = false;
      }
    });

    // Link the selected share types
    async function handleLink() {
      if (!props.shareTypeStore.instanceStore.selected.value) return;
      const instanceId = props.shareTypeStore.instanceStore.selected.value.id;
      const errors = [] as string[];

      await Promise.all(selected.value.map(async (shareType) => {
        try {
          await props.shareTypeStore.linkShareType({
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

      await props.shareTypeStore.fetch();
      await fetchAvailableShareTypes();
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
      id,
      formErrors,
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
