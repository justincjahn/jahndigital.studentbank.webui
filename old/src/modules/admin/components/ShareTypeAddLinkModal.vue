<template>
  <modal
    title="Add and Link Share Types"
    ok-label="Close"
    class="large"
    :show="show"
    :handle-enter="false"
    @ok="handleOk"
  >
    <form class="stf" @submit.prevent="handleAdd">
      <share-type-add-edit-form
        v-model="formData"
        v-model:isValid="isValid"
        v-model:shouldReset="shouldReset"
      />

      <button
        type="submit"
        class="primary"
        :disabled="addLoading || !isValid"
      >
        <loading-label :show="addLoading">
          <template v-if="addLoading">
            Adding...
          </template>
          <template v-else>
            Add
          </template>
        </loading-label>
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
  </modal>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, computed, watchEffect, PropType } from 'vue';

// Utils
import Rate from '@/utils/rate';
import Money from '@/utils/money';

// Stores
import { GlobalStore } from '../stores/global';

// Composables
import { buildFormData } from '../composables/useShareTypeForm';

/**
 * Allows users to create new Share Types and then link them to the currently selected
 * instance.  Updates the global shareTypeStore to ensure the new share type(s) are valid.
 */
export default defineComponent({
  components: {
    Modal: defineAsyncComponent(() => import('@/components/Modal.vue')),
    LoadingLabel: defineAsyncComponent(() => import('@/components/LoadingLabel.vue')),
    ShareTypeMultiselect: defineAsyncComponent(() => import('./ShareTypeMultiselector.vue')),
    ShareTypeAddEditForm: defineAsyncComponent(() => import('./forms/ShareTypeAddEditForm.vue')),
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    store: {
      type: Object as PropType<GlobalStore>,
      required: true,
    },
  },
  emits: [
    'ok',
  ],
  setup(props, { emit }) {
    // True if a share type add operation is awaiting the server.
    const addLoading = ref(false);

    // An array of selected share types
    const selected = ref<ShareType[]>([]);

    // True if the share type add/edit form is valid
    const isValid = ref(false);

    // Set to true in order to trigger a share type add/edit form reset
    const shouldReset = ref(false);

    // Data for share type add/edit form
    const formData = buildFormData();

    // Filter share types that are already in the selected instance
    const shareTypes = computed(() => {
      const instanceId = props.store.shareType.instanceStore?.selected?.value?.id ?? -1;
      const filtered = props.store.shareTypeAvailable.shareTypes.value.filter((st) => {
        const hasInstance = st.shareTypeInstances.find((instance) => instance.instanceId === instanceId);
        return !hasInstance;
      });

      return filtered;
    });

    // True if the link button should be enabled
    const canLink = computed(() => selected.value.length > 0);

    /**
     * Reset the form back to defaults
     */
    function reset() { shouldReset.value = true; }

    /**
     * Tell the parent to close the modal
     */
    function handleOk() { reset(); emit('ok'); }

    /**
     * Fetch a list of available share types using our custom store.
     */
    async function fetchAvailableShareTypes() {
      await props.store.shareTypeAvailable.fetch({ cache: false });
    }

    /**
     * Add a new share type and refresh available share types
     */
    async function handleAdd() {
      addLoading.value = true;

      try {
        await props.store.shareTypeAvailable.newShareType({
          ...formData,
          dividendRate: Rate.fromStringOrDefault(formData.dividendRate).getRate(),
          withdrawalLimitCount: +formData.withdrawalLimitCount,
          withdrawalLimitFee: Money.fromStringOrDefault(formData.withdrawalLimitFee).getAmount(),
        });

        reset();
        await fetchAvailableShareTypes();
      } catch (e) {
        if (e instanceof Error) {
          props.store.error.setCurrentError('Unable to add the Share Type.  Does it already exist?');
        }
      } finally {
        addLoading.value = false;
      }
    }

    /**
     * Link the selected share types
     */
    async function handleLink() {
      if (!props.store.shareType.instanceStore) return;
      if (!props.store.shareType.instanceStore.selected.value) return;
      const instanceId = props.store.shareType.instanceStore.selected.value.id;
      const errors = [] as string[];

      await Promise.all(selected.value.map(async (shareType) => {
        try {
          await props.store.shareType.linkShareType({
            shareTypeId: shareType.id,
            instanceId,
          });
        } catch (e) {
          if (e instanceof Error) {
            errors.push(e?.message ?? e);
          }
        }
      }));

      if (errors.length > 0) {
        props.store.error.setCurrentError(errors.join(', '));
      }

      // Refetch the share types from the API since we know they've changed on the server
      await props.store.shareType.fetch({ cache: false });
      await fetchAvailableShareTypes();
    }

    // Perform initial fetch of available share types on show
    watchEffect(() => {
      if (props.show) fetchAvailableShareTypes();
    });

    return {
      isValid,
      shouldReset,
      formData,
      selected,
      shareTypes,
      loading: props.store.shareTypeAvailable.loading,
      addLoading,
      handleOk,
      handleAdd,
      handleLink,
      canLink,
    };
  },
});
</script>

<style lang="scss" scoped>
$size: 35rem;

.stf {
  @include round-border;

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
