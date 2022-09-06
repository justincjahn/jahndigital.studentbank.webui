<template>
  <modal
    title="Edit Share Type"
    class="large est"
    ok-label="Save"
    cancel-label="Cancel"
    :show="show"
    :can-cancel="!loading"
    :handle-escape="!loading"
    :can-submit="canSubmit"
    :handle-enter="canSubmit"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <share-type-add-edit-form
      v-model="formData"
      v-model:isValid="isValid"
      v-model:shouldReset="shouldReset"
      :share-type="shareType"
    />
  </modal>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, PropType, ref, computed } from 'vue';

// Utils
import Rate from '@/utils/rate';
import Money from '@/utils/money';

// Stores
import { GlobalStore } from '../stores/global';

// Composables
import { buildFormData } from '../composables/useShareTypeForm';

export default defineComponent({
  components: {
    Modal: defineAsyncComponent(() => import('@/components/Modal.vue')),
    ShareTypeAddEditForm: defineAsyncComponent(() => import('./forms/ShareTypeAddEditForm.vue')),
  },
  props: {
    store: {
      type: Object as PropType<GlobalStore>,
      required: true,
    },
    shareType: {
      type: Object as PropType<ShareType|null>,
      default: null,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'ok',
  ],
  setup(props, { emit }) {
    const loading = ref(false);
    const isValid = ref(false);
    const shouldReset = ref(false);
    const formData = buildFormData();

    const canSubmit = computed(() => {
      if (loading.value) return false;
      return isValid.value;
    });

    /**
     * Ask the parent to close the dialog
     */
    function handleCancel() {
      shouldReset.value = true;
      emit('ok');
    }

    /**
     * Persist changes and ask the parent to close the dialog.
     */
    async function handleOk() {
      if (!props.shareType) return;
      loading.value = true;

      try {
        await props.store.shareType.updateShareType({
          ...formData,
          dividendRate: Rate.fromStringOrDefault(formData.dividendRate).getRate(),
          withdrawalLimitCount: +formData.withdrawalLimitCount,
          withdrawalLimitFee: Money.fromStringOrDefault(formData.withdrawalLimitFee).getAmount(),
        });
      } catch (e) {
        if (e instanceof Error) {
          props.store.error.setCurrentError(e?.message ?? e);
        }
      } finally {
        loading.value = false;
      }

      emit('ok');
    }

    return {
      loading,
      isValid,
      shouldReset,
      formData,
      canSubmit,
      handleCancel,
      handleOk,
    };
  },
});
</script>
