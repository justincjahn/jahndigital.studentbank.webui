<script setup lang="ts">
import type { Share } from '@/common/services/share';
import { computed } from 'vue';
import Money from '@/common/utils/Money';
import Rate from '@/common/utils/Rate';
import { Period } from '@/generated/graphql';

const props = defineProps<{
  share: Share;
  selected: boolean;
}>();

const classes = computed(() => [
  'card',
  'no-select',
  {
    selected: props.selected,
  },
]);

const description = computed(() => props.share.shareType.name);
const balance = computed(() => Money.fromNumber(props.share.balance));
const withdrawalCount = computed(() => props.share.limitedWithdrawalCount);

const rate = computed(() =>
  Rate.fromNumber(props.share.shareType.dividendRate)
);

const withdrawalLimit = computed(
  () => props.share.shareType.withdrawalLimitCount
);

const withdrawalPeriod = computed(() => {
  const raw = props.share.shareType.withdrawalLimitPeriod;
  return Object.keys(Period)[Object.values(Period).indexOf(raw)] ?? 'Unknown';
});
</script>

<template>
  <div :class="classes" data-card-clickable>
    <div class="flex-group height-100" data-flex-direction="column">
      <div>
        <h2 class="size-l">{{ description }}</h2>

        <div class="split-data emphasis">
          <span>Available Balance</span>
          <span :class="{ error: balance.getAmount() < 0 }">{{ balance }}</span>
        </div>

        <div v-if="rate.getRate() > 0" class="split-data">
          <span>Dividend Rate</span>
          <span>{{ rate }}</span>
        </div>

        <template v-if="withdrawalLimit">
          <div class="split-data">
            <span>Withdrawal Limit</span>
            <span>{{ withdrawalLimit }}</span>
          </div>

          <div class="split-data">
            <span>Withdrawal Period</span>
            <span>{{ withdrawalPeriod }}</span>
          </div>

          <div class="split-data">
            <span>Withdrawals this Period</span>
            <span>{{ withdrawalCount }}</span>
          </div>
        </template>
      </div>

      <div v-if="$slots.default">
        <slot />
      </div>
    </div>
  </div>
</template>
