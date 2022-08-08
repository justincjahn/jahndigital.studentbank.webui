<template>
  <modal
    title="Dividend Posting"
    ok-label="Post"
    cancel-label="Cancel"
    class="dpm"
    :show="show"
    :can-submit="canPost"
    :handle-enter="canPost"
    :can-cancel="!loading"
    :handle-escape="!loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div v-if="instance">
      <p>
        Posting dividends for the <em>{{ instance.description }}</em> instance. Select a Share Type
        below and press <strong>Post</strong> when you are ready.
      </p>
    </div>

    <share-type-selector
      v-model="selected"
      :store="store"
    />

    <p v-if="selected && selected.dividendRate <= 0" class="error">
      ERROR: The selected Share Type does not have a dividend rate.  Please select a different one
      or edit the Share Type.
    </p>

    <p v-if="selected && selected.dividendRate > 0">
      Dividend Rate: {{ rate }}
    </p>
  </modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';

// Utils
import Rate from '@/utils/rate';

// Components
import Modal from '@/components/Modal.vue';
import ShareTypeSelector from './ShareTypeSelector.vue';

// Stores
import { GlobalStore } from '../stores/global';

export default defineComponent({
  components: {
    Modal,
    ShareTypeSelector,
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
    const shareTypeStore = computed(() => props.store.shareType);

    const setCurrentError = (value: string|null) => {
      props.store.error.setCurrentError(value);
    };

    const loading = ref(false);
    const selectedInstance = computed(() => props.store.instance.selected.value);
    const canPost = computed(() => !loading.value && props.store.shareType.selected.value !== null
      && props.store.shareType.selected.value.dividendRate > 0);

    const rate = computed(() => {
      if (!props.store.shareType.selected.value) return 'NA';
      return Rate.fromNumber(props.store.shareType.selected.value.dividendRate).getPercent();
    });

    /**
     * Reset the modal back to the default state.
     */
    function reset() {
      shareTypeStore.value.selected.value = null;
    }

    /**
     * Post dividends and tell the parent to close this modal once finished.
     */
    async function handleOk() {
      if (!props.store.shareType.selected.value) return;
      if (!selectedInstance.value) return;

      loading.value = true;
      try {
        await props.store.shareType.postDividends({
          shareTypeId: props.store.shareType.selected.value.id,
          instances: [
            selectedInstance.value.id,
          ],
        });

        emit('ok');
      } catch (e) {
        if (e instanceof Error) {
          setCurrentError(e?.message ?? e);
        }
      } finally {
        loading.value = false;
      }
    }

    /**
     * Clear the modal and cancel.
     */
    function handleCancel() { emit('ok'); }

    // Clear the modal every time it opens
    watchEffect(() => props.show && reset());

    return {
      loading,
      selected: props.store.shareType.selected,
      instance: selectedInstance,
      canPost,
      rate,
      handleOk,
      handleCancel,
    };
  },
});
</script>

<style lang="scss">
  .dpm .share-type-selector {
    margin: 1em 0;
  }
</style>
