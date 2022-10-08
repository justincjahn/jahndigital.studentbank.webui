<script lang="ts" setup>
import { computed, watchEffect } from 'vue';

// Services
import { ShareType } from '@/admin/common/services/shareType';

// Components
import {
  VInput,
  VCheckbox,
  VRate,
  VCurrency,
} from '@/common/components/inputs';

// Composables
import WithdrawalPeriodSelector from '@/admin/common/components/WithdrawalPeriodSelector.vue';
import useShareTypeForm, { ShareTypeDTO } from './useShareTypeForm';

const props = defineProps<{
  modelValue: ShareTypeDTO;
  selected?: ShareType | null;
  valid: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: ShareTypeDTO): void;
  (event: 'update:valid', value: boolean): void;
}>();

const { data, errors, isValid, reset } = useShareTypeForm(props.modelValue);

const withdrawalEnabled = computed(() => +data.withdrawalLimitCount > 0);

watchEffect(() => {
  emit('update:valid', isValid.value);
});

watchEffect(() => {
  if (props.selected) {
    reset(props.selected);
  } else {
    reset();
  }
});
</script>

<template>
  <v-input
    v-model="data.name"
    :error="errors.name"
    name="share-type-name"
    label="Name"
    required
  />

  <v-rate
    v-model="data.dividendRate"
    :error="errors.dividendRate"
    name="share-type-rate"
    label="Dividend Rate"
    required
  />

  <v-input
    v-model="data.withdrawalLimitCount"
    :error="errors.withdrawalLimitCount"
    name="share-type-wd-limit"
    label="Maximum Withdrawals"
  />

  <withdrawal-period-selector
    v-model="data.withdrawalLimitPeriod"
    label="Withdrawal Period"
    name="share-type-wd-period"
    :disabled="!withdrawalEnabled"
  />

  <v-checkbox
    v-model="data.withdrawalLimitShouldFee"
    label="Fee instead of decline?"
    name="share-type-wd-should-fee"
    :disabled="!withdrawalEnabled"
  />

  <v-currency
    v-model="data.withdrawalLimitFee"
    :error="errors.withdrawalLimitFee"
    label="Withdrawal Fee"
    name="share-type-wd-fee"
    :allow-negative="false"
    :allow-zero="true"
    :disabled="!withdrawalEnabled"
  />
</template>
