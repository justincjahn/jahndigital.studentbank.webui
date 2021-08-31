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
          <loading-label :show="linkedLoading">
            Unlink Selected
          </loading-label>
        </button>
      </div>

      <div class="stunl__delete">
        <h2>Delete</h2>

        <share-type-multiselect
          v-model="deletableSelected"
          prompt="There are no Share Types that can be deleted.  Share Types must be unlinked
            from all instances to be deletable."
          :share-types="deletableShareTypes"
          :loading="deletableLoading"
        />

        <button
          class="stunl__linked--unlink primary"
          :disabled="!canDelete"
          @click.prevent="handleDelete"
        >
          <loading-label :show="deletableLoading">
            Delete Selected
          </loading-label>
        </button>
      </div>
    </div>
  </modal>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';

// Components
import Modal from '@/components/Modal.vue';
import LoadingLabel from '@/components/LoadingLabel.vue';
import ShareTypeMultiselect from '@/modules/admin/components/ShareTypeMultiselector.vue';

// Store
import { GlobalStore } from '../stores/global';

export default defineComponent({
  components: {
    Modal,
    ShareTypeMultiselect,
    LoadingLabel,
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
    'cancel',
  ],
  setup(props, { emit }) {
    // An array of selected share types
    const linkedSelected = ref<ShareType[]>([]);

    // True if the unlink button should be enabled
    const canUnlink = computed(() => {
      const loading = props.store.shareType.loading.value;
      if (loading) return false;

      if (linkedSelected.value.length === 0) return false;
      return true;
    });

    // Array of selected share types to delete
    const deletableSelected = ref<ShareType[]>([]);

    // Array of share types without any links.
    const deletableShareTypes = computed(
      () => props.store.shareTypeAvailable.shareTypes.value
        .filter((x) => x.shareTypeInstances.length === 0),
    );

    // True if the unlink button should be enabled
    const canDelete = computed(() => {
      const loading = props.store.shareTypeAvailable.loading.value;
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
      await props.store.shareTypeAvailable.fetch({ cache: false });
    }

    /**
     * Unlink the currently selected share types.
     */
    async function handleUnlink() {
      const instanceId = props.store.instance.selected.value?.id ?? -1;
      if (instanceId === -1) return;

      const errors = [] as string[];
      await Promise.all(linkedSelected.value.map(async (shareType) => {
        try {
          await props.store.shareType.unlinkShareType({
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
        props.store.error.setCurrentError(errors.join(', '));
      }

      // Refetch the share types from the API since we know they've changed on the server
      await props.store.shareType.fetch({ cache: false });
      await fetchAvailableShareTypes();
    }

    /**
     * Unlink the currently selected share types.
     */
    async function handleDelete() {
      const errors = [] as string[];
      await Promise.all(deletableSelected.value.map(async (shareType) => {
        try {
          await props.store.shareType.deleteShareType(shareType);
        } catch (e) {
          errors.push(e?.message ?? e);
        } finally {
          deletableSelected.value = [];
        }
      }));

      if (errors.length > 0) {
        props.store.error.setCurrentError(errors.join(', '));
      }

      // Refetch the share types from the API since we know they've changed on the server
      await props.store.shareType.fetch({ cache: false });
      await fetchAvailableShareTypes();
    }

    watchEffect(() => {
      if (props.show) {
        props.store.shareType.fetch();
        fetchAvailableShareTypes();
      }
    });

    return {
      linkedSelected,
      linkedShareTypes: props.store.shareType.shareTypes,
      linkedLoading: props.store.shareType.loading,
      canUnlink,
      deletableSelected,
      deletableShareTypes,
      deletableLoading: props.store.shareTypeAvailable.loading,
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
