<template>
  <modal
    title="Delete and Unlink Share Types"
    ok-label="Close"
    class="large"
    :show="show"
    :handle-enter="false"
    @ok="handleOk"
  >
    <div class="stunl">
      <div class="stunl__linked">
        <h2>Unlink</h2>

        <share-type-multiselect
          v-model="linkedSelected"
          prompt="There are no Share Types currently linked to this instance."
          :share-types="linkedShareTypes"
          :loading="linkedLoading"
        />

        <button
          class="stunl__linked--unlink primary"
          :disabled="!canUnlink"
          @click.prevent="handleUnlink"
        >
          <loading-icon :show="linkedLoading">
            Unlink Selected
          </loading-icon>
        </button>
      </div>

      <div class="stunl__delete">
        <h2>Delete</h2>

        <share-type-multiselect
          v-model="deletableSelected"
          prompt="There are no Share Types that can be deleted.  Share Types must be unlinked from all instances to be deletable."
          :share-types="deletableShareTypes"
          :loading="deletableLoading"
        />

        <button
          class="stunl__linked--unlink primary"
          :disabled="!canDelete"
          @click.prevent="handleDelete"
        >
          <loading-icon :show="deletableLoading">
            Delete Selected
          </loading-icon>
        </button>
      </div>
    </div>
  </modal>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';

// Components
import Modal from '@/components/Modal.vue';
import LoadingIcon from '@/components/LoadingIcon.vue';
import ShareTypeMultiselect from '@/modules/admin/components/ShareTypeMultiselector.vue';

// Store
import errorStore from '@/store/error';
import { setup as defineShareTypeStore, ShareTypeStore } from '../stores/shareType';

export default defineComponent({
  components: {
    Modal,
    ShareTypeMultiselect,
    LoadingIcon,
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
    'cancel',
  ],
  setup(props, { emit }) {
    // Use a bespoke ShareTypeStore for the available share types list so we don't muddle parent state.
    const shareTypeStore = defineShareTypeStore();

    // An array of selected share types
    const linkedSelected = ref<ShareType[]>([]);

    // True if the unlink button should be enabled
    const canUnlink = computed(() => {
      const loading = props.shareTypeStore.loading.value;
      if (loading) return false;

      if (linkedSelected.value.length === 0) return false;
      return true;
    });

    // Array of selected share types to delete
    const deletableSelected = ref<ShareType[]>([]);

    // Array of share types without any links.
    const deletableShareTypes = computed(() => shareTypeStore.shareTypes.value.filter((x) => x.shareTypeInstances.length === 0));

    // True if the unlink button should be enabled
    const canDelete = computed(() => {
      const loading = shareTypeStore.loading.value;
      if (loading) return false;

      if (deletableSelected.value.length === 0) return false;
      return true;
    });

    /**
     * Emit an OK event when users click the OK button on the modal.
     */
    function handleOk() { emit('ok'); }

    /**
     * Fetch a list of available share types using our custom store.
     */
    async function fetchAvailableShareTypes() {
      await shareTypeStore.fetch({ cache: false });
    }

    /**
     * Unlink the currently selected share types.
     */
    async function handleUnlink() {
      const instanceId = props.shareTypeStore.instanceStore?.selected.value?.id ?? -1;
      if (instanceId === -1) return;

      const errors = [] as string[];
      await Promise.all(linkedSelected.value.map(async (shareType) => {
        try {
          await props.shareTypeStore.unlinkShareType({
            shareTypeId: shareType.id,
            instanceId,
          });
        } catch (e) {
          errors.push(e?.message ?? e);
        } finally {
          linkedSelected.value = [];
        }
      }));

      if (errors.length > 0) {
        errorStore.setCurrentError(errors.join(', '));
      }

      // Refetch the share types from the API since we know they've changed on the server
      await props.shareTypeStore.fetch({ cache: false });
      await fetchAvailableShareTypes();
    }

    /**
     * Unlink the currently selected share types.
     */
    async function handleDelete() {
      const errors = [] as string[];
      await Promise.all(deletableSelected.value.map(async (shareType) => {
        try {
          await props.shareTypeStore.deleteShareType(shareType);
        } catch (e) {
          errors.push(e?.message ?? e);
        } finally {
          deletableSelected.value = [];
        }
      }));

      if (errors.length > 0) {
        errorStore.setCurrentError(errors.join(', '));
      }

      // Refetch the share types from the API since we know they've changed on the server
      await props.shareTypeStore.fetch({ cache: false });
      await fetchAvailableShareTypes();
    }

    watchEffect(() => {
      if (props.show) {
        props.shareTypeStore.fetch();
        fetchAvailableShareTypes();
      }
    });

    return {
      linkedSelected,
      linkedShareTypes: props.shareTypeStore.shareTypes,
      linkedLoading: props.shareTypeStore.loading,
      canUnlink,
      deletableSelected,
      deletableShareTypes,
      deletableLoading: shareTypeStore.loading,
      canDelete,
      handleOk,
      handleUnlink,
      handleDelete,
    };
  },
});
</script>

<style lang="scss">
  .stunl {
    width: 35rem;
    margin: 0px auto;

    button {
      width: 100%;
    }

    &__delete {
      h2 {
        margin-top: 1em;
      }
    }
  }
</style>
