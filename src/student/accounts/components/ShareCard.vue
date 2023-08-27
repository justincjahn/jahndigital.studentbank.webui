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
  'share-card',
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
  <div :class="classes">
    <h2>{{ description }}</h2>

    <div class="share-card__balance">
      <span>Available Balance</span>
      <span :class="{ error: balance.getAmount() < 0 }">{{ balance }}</span>
    </div>

    <div v-if="rate.getRate() > 0" class="share-card__attribute">
      <span>Dividend Rate</span>
      <span>{{ rate }}</span>
    </div>

    <template v-if="withdrawalLimit">
      <div class="share-card__attribute">
        <span>Withdrawal Limit</span>
        <span>{{ withdrawalLimit }}</span>
      </div>

      <div class="share-card__attribute">
        <span>Withdrawal Period</span>
        <span>{{ withdrawalPeriod }}</span>
      </div>

      <div class="share-card__attribute">
        <span>Withdrawals this Period</span>
        <span>{{ withdrawalCount }}</span>
      </div>
    </template>
  </div>
</template>

<style>
.share-card {
  width: var(--card-width, 20rem);
  min-height: 12rem;
  padding: 1rem;

  color: hsl(var(--clr-neutral-900) / 60%);
  background-color: hsl(var(--clr-neutral-400) / 25%);

  border-radius: 0.5rem;

  box-shadow:
    hsl(var(--clr-neutral-900) / 15%) 0px 1px 2px 0px,
    hsl(var(--clr-neutral-600) / 30%) 0px 1px 3px 1px;

  transition:
    box-shadow 0.25s,
    color 0.25s,
    background-color 0.25s;
}

.share-card:hover {
  cursor: pointer;

  color: inherit;
  background-color: hsl(var(--clr-neutral-100));

  box-shadow:
    hsl(var(--clr-neutral-600) / 15%) 0px 3px 6px,
    hsl(var(--clr-neutral-900) / 25%) 0px 3px 6px;
}

.share-card.selected {
  color: inherit;
  background-color: hsl(var(--clr-neutral-100));

  box-shadow:
    hsl(var(--clr-accent1-700) / 30%) 0px 1px 2px 0px,
    hsl(var(--clr-accent1-400) / 25%) 0px 1px 3px 1px;
}

.share-card__balance {
  font-weight: 600;
}

.share-card__balance,
.share-card__attribute {
  display: flex;
  justify-content: space-between;
}

:is(.share-card__balance, .share-card__attribute) :nth-child(1) {
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

:is(.share-card__balance, .share-card__attribute) :nth-child(1)::after {
  content: '..................................................................';
}
</style>
