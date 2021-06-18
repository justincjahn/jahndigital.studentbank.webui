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
      :share-type-store="shareTypeStore"
    />

    <p v-if="selected && selected.dividendRate <= 0" class="error">
      ERROR: The selected Share Type does not have a dividend rate.  Please select a different one or edit the Share Type.
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
// eslint-disable-next-line import/order
import errorStore from '@/stores/error';
import { ShareTypeStore } from '../stores/shareType';

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
    shareTypeStore: {
      type: Object as PropType<ShareTypeStore>,
      required: true,
    },
    instance: {
      type: Object as PropType<Instance|null>,
      default: null,
    },
  },
  emits: [
    'ok',
  ],
  setup(props, { emit }) {
    const loading = ref(false);
    const selected = ref<ShareType|null>(null);

    // True if the dividends can be posted
    const canPost = computed(() => !loading.value && selected.value !== null && selected.value.dividendRate > 0);

    // Use the Rate util to generate the correct dividend rate.
    const rate = computed(() => {
      if (!selected.value) return 'NA';
      return Rate.fromNumber(selected.value.dividendRate).getPercent();
    });

    /**
     * Reset the modal back to the default state.
     */
    function reset() { selected.value = null; }

    /**
     * Post dividends and tell the parent to close this modal once finished.
     */
    async function handleOk() {
      if (!selected.value) return;
      if (!props.instance) return;

      loading.value = true;
      try {
        await props.shareTypeStore.postDividends({
          shareTypeId: selected.value.id,
          instances: [
            props.instance.id,
          ],
        });

        emit('ok');
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
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
      selected,
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
