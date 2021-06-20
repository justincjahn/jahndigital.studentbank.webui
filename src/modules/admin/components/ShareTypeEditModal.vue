<template>
  <modal
    title="Edit Share Type"
    class="large"
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
        :class="{ error: nameError.length > 0}"
        type="text"
      />

      <p v-if="nameError.length > 0" class="error est--error">
        {{ nameError }}
      </p>
    </div>

    <div class="est--fieldset">
      <label :for="rateId">
        Dividend Rate
      </label>

      <p class="help-text">
        When dividends are posted, what percentage return should the shares of this type receive?
      </p>

      <rate-input
        :id="rateId"
        v-model="rateValue"
        v-model:error="rateError"
        :allow-negative="false"
        :class="{ error: rateError.length > 0 }"
      />

      <p v-if="rateError.length > 0" class="error est--error">
        {{ rateError }}
      </p>
    </div>

    <div class="est--fieldset">
      <label :for="wdCountId">
        Maximum Withdrawals
      </label>

      <p class="help-text">
        How many withdrawals per period should be allowed without being declined?
        Specify <code>0</code> to disable withdrawal limits.
      </p>

      <input
        :id="wdCountId"
        v-model="wdCount"
        type="text"
      />

      <p v-if="wdCountError" class="error">
        {{ wdCountError }}
      </p>
    </div>

    <div class="est--fieldset">
      <label :for="wdPeriodId">
        Withdrawal Period
      </label>

      <p class="help-text">
        After how long should the withdrawal limit on the shares of this type be reset?
      </p>

      <base-select
        v-model="wdPeriod"
        :options="wdPeriodOptions"
      />
    </div>

    <div class="est--fieldset inline">
      <label :for="wdShouldFeeId">
        Fee Instead of Decline?
      </label>

      <input
        :id="wdShouldFeeId"
        v-model="wdShouldFee"
        type="checkbox"
      />
    </div>

    <div class="est--fieldset">
      <label :for="wdFeeId">
        Withdrawal Fee
      </label>

      <p class="help-text">
        How much should the student be charged for withdrawals past the limit?  Only valid if
        "Fee Instead of Decline" is checked.
      </p>

      <currency-input
        :id="wdFeeId"
        v-model="wdFee"
        v-model:error="wdFeeError"
        :allow-negative="false"
        :allow-zero="true"
      />

      <p v-if="wdFeeError" class="error">
        {{ wdFeeError }}
      </p>
    </div>
  </modal>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, PropType, ref, computed, watchEffect } from 'vue';

// Utils
import Rate from '@/utils/rate';
import uuid4 from '@/utils/uuid4';
import { validateShareTypeName } from '@/utils/validators';

// Enums
import Period from '@/enums/Period';

// Components
import Modal from '@/components/Modal.vue';
import RateInput from '@/components/RateInput.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';

// Composables
import useValidation from '@/composables/useValidation';

// Stores
import { ShareTypeStore } from '@/modules/admin/stores/shareType';
import errorStore from '@/stores/error';

export default defineComponent({
  components: {
    Modal,
    RateInput,
    CurrencyInput,
    BaseSelect: defineAsyncComponent(() => import('@/components/BaseSelect.vue')),
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
    const wdCountId = `est-wd-count--${id}`;
    const wdPeriodId = `est-wd-period--${id}`;
    const wdShouldFeeId = `est-wd-should-fee--${id}`;
    const wdFeeId = `est-wd-fee--${id}`;

    const loading = ref(false);

    const { value: nameValue, error: nameError } = useValidation(validateShareTypeName);

    const rateValue = ref('0.00');
    const rateError = ref('');

    const wdCount = ref('0');
    const wdCountError = ref('');

    const wdPeriod = ref<PeriodStrings|null>(null);
    const wdPeriodOptions = Object.keys(Period);
    const wdPeriodError = ref('');

    const wdShouldFee = ref(false);

    const wdFee = ref('0.00');
    const wdFeeError = ref('');

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
      wdCountId,
      wdPeriodId,
      wdShouldFeeId,
      wdFeeId,
      loading,
      nameValue,
      nameError,
      rateValue,
      rateError,
      wdCount,
      wdCountError,
      wdPeriod,
      wdPeriodOptions,
      wdPeriodError,
      wdShouldFee,
      wdFee,
      wdFeeError,
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

    &.inline {
      flex-direction: row;
      align-items: center;

      input {
        width: auto;
        margin-left: 1em;
      }
    }
  }

  &--fieldset + &--fieldset {
    margin-top: 1em;
  }
}
</style>
