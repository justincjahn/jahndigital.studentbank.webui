<template>
  <suspense>
    <template #default>
      <div class="stae-form">
        <base-input
          :id="`stae-form__name--${id}`"
          v-model="data.name"
          v-model:error="errors.name"
          label="Name"
          required
          :validator="validateShareTypeName"
        />

        <rate-input
          :id="`stae-form__rate--${id}`"
          v-model="data.dividendRate"
          v-model:error="errors.dividendRate"
          label="Dividend Rate"
          required
          :allow-negative="false"
        >
          <template #help="{ className }">
            <p :class="className">
              When dividends are posted, what percentage return should the shares of this type receive?
            </p>
          </template>
        </rate-input>

        <base-input
          :id="`stae-form__wdlimitcount--${id}`"
          v-model="data.withdrawalLimitCount"
          v-model:error="errors.withdrawalLimitCount"
          label="Maximum Withdrawals"
          :validator="validateCountNotNegative"
        >
          <template #help="{ className }">
            <p :class="className">
              How many withdrawals per period should be allowed without being declined?
              Specify <code>0</code> to disable withdrawal limits.
            </p>
          </template>
        </base-input>

        <withdrawal-period-input
          :id="`stae-form__wdperiod--${id}`"
          v-model="data.withdrawalLimitPeriod"
          label="Withdrawal Period"
          help-text="After how long should the withdrawal limit on the shares of this type be reset?"
          :disabled="!wdEnabled"
        />

        <base-checkbox
          :id="`stae-form__wdshouldfee--${id}`"
          v-model="data.withdrawalLimitShouldFee"
          label="Fee instead of decline?"
          :disabled="!wdEnabled"
        />

        <currency-input
          :id="`stae-form__wdfee--${id}`"
          v-model="data.withdrawalLimitFee"
          v-model:error="errors.withdrawalLimitFee"
          label="Withdrawal Fee"
          :allow-negative="false"
          :allow-zero="true"
          :disabled="!wdEnabled"
        >
          <template #help="{ className }">
            <p :class="className">
              How much should the student be charged for withdrawals past the limit?
              Only valid if "Fee Instead of Decline" is checked.
            </p>
          </template>
        </currency-input>
      </div>
    </template>
    <template #fallback>
      Loading...
    </template>
  </suspense>
</template>

<script lang="ts">
import { defineComponent, PropType, defineAsyncComponent, computed, watch, watchEffect } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { validateShareTypeName, validateCountNotNegative } from '@/utils/validators';

// Composables
import useShareTypeForm, { ShareTypeDTO } from '../../composables/useShareTypeForm';

export default defineComponent({
  components: {
    BaseInput: defineAsyncComponent(() => import('@/components/BaseInput.vue')),
    BaseCheckbox: defineAsyncComponent(() => import('@/components/BaseCheckbox.vue')),
    RateInput: defineAsyncComponent(() => import('@/components/RateInput.vue')),
    CurrencyInput: defineAsyncComponent(() => import('@/components/CurrencyInput.vue')),
    WithdrawalPeriodInput: defineAsyncComponent(() => import('@/components/WithdrawalPeriodInput.vue')),
  },
  props: {
    shareType: {
      type: Object as PropType<ShareType|null>,
      default: null,
    },
    modelValue: {
      type: Object as PropType<ShareTypeDTO>,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: false,
    },
    shouldReset: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:modelValue',
    'update:isValid',
    'update:shouldReset',
  ],
  setup(props, { emit }) {
    const id = uuid4();
    const { data, errors, isValid, reset } = useShareTypeForm(props.modelValue);
    const wdEnabled = computed(() => +data.withdrawalLimitCount > 0);

    // Update the parent when the isValid prop changes
    watch(() => isValid.value, () => {
      emit('update:isValid', isValid.value);
    }, { immediate: true });

    // Reset the form if the parent requests it
    // TODO: There has to be a better way to do this...
    watch(() => props.shouldReset, () => {
      if (!props.shouldReset) return;
      reset(props.shareType ?? undefined);
      emit('update:shouldReset', false);
    });

    // When the ShareType object passed to us changes, reset the form with the new data
    watchEffect(() => {
      if (props.shareType) {
        reset(props.shareType);
      }
    });

    return {
      id,
      data,
      errors,
      wdEnabled,
      validateShareTypeName,
      validateCountNotNegative,
    };
  },
});
</script>
