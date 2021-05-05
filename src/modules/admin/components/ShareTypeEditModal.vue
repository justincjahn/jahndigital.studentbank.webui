<template>
  <modal
    title="Edit Share Type"
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
    <div class="est--fieldset">
      <label :for="nameId">
        Name
      </label>

      <input
        :id="nameId"
        v-model="nameValue"
        type="text"
      />
    </div>

    <p v-if="nameError.length > 0" class="error est--error">
      {{ nameError }}
    </p>

    <div class="est--fieldset">
      <label :for="rateId">
        Dividend Rate
      </label>

      <rate-input
        :id="rateId"
        v-model="rateValue"
        v-model:error="rateError"
      />
    </div>

    <p v-if="rateError.length > 0" class="error est--error">
      {{ rateError }}
    </p>
  </modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';

// Utils
import Rate from '@/utils/rate';
import uuid4 from '@/utils/uuid4';
import { validateShareTypeName } from '@/utils/validators';

// Components
import Modal from '@/components/Modal.vue';
import RateInput from '@/components/RateInput.vue';

// Composables
import useValidation from '@/composables/useValidation';

// Stores
import { ShareTypeStore } from '@/modules/admin/stores/shareType';
import errorStore from '@/store/error';

export default defineComponent({
  components: {
    Modal,
    RateInput,
  },
  props: {
    shareTypeStore: {
      type: Object as PropType<ShareTypeStore>,
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
    const id = uuid4();
    const nameId = `est--name--${id}`;
    const rateId = `est--rate--${id}`;

    const loading = ref(false);

    const { value: nameValue, error: nameError } = useValidation(validateShareTypeName);

    const rateValue = ref('0.00');
    const rateError = ref('');

    const canSubmit = computed(() => {
      if (loading.value) return false;
      if (rateError.value.length > 0) return false;
      if (nameError.value.length > 0) return false;
      return true;
    });

    /**
     * Reset the form back to defaults.
     */
    function reset() {
      rateValue.value = Rate.fromNumber(props.shareType?.dividendRate ?? 0.0).getPercent();
      nameValue.value = props.shareType?.name ?? '';
    }

    /**
     * Ask the parent to close the dialog
     */
    function handleCancel() {
      reset();
      emit('ok');
    }

    /**
     * Persist changes and ask the parent to close the dialog.
     */
    async function handleOk() {
      if (!props.shareType) return;

      loading.value = true;

      try {
        await props.shareTypeStore.updateShareType({
          id: props.shareType.id,
          name: nameValue.value,
          dividendRate: Rate.fromStringOrDefault(rateValue.value).getRate(),
        });
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }

      emit('ok');
    }

    watchEffect(() => {
      if (props.show && props.shareType) {
        reset();
      }
    });

    return {
      nameId,
      rateId,
      loading,
      nameValue,
      nameError,
      rateValue,
      rateError,
      canSubmit,
      handleCancel,
      handleOk,
    };
  },
});
</script>

<style lang="scss">
.est {
  &--fieldset {
    display: flex;
    flex-direction: column;

    input {
      width: 100%;
    }
  }

  &--fieldset + &--fieldset {
    margin-top: 1em;
  }
}
</style>
