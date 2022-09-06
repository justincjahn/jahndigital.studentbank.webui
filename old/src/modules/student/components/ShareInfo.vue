<template>
  <div v-if="share" class="share-info">
    <slot :shareName="name" :share="share">
      <h3 class="share-info__name">
        {{ name }}
      </h3>
    </slot>

    <p class="share-info__item share-info__item--focused">
      <span>Available Balance</span>

      {{
        new Intl.NumberFormat(
          'en-US',
          {
            style: 'currency',
            currency: 'USD',
          }
        ).format(share.balance)
      }}
    </p>

    <template v-if="(share.shareType?.withdrawalLimitCount ?? -1) > 0">
      <p class="share-info__item">
        <span>Withdrawal Limit</span>

        {{ share.shareType?.withdrawalLimitCount ?? 0 }}
      </p>

      <p class="share-info__item">
        <span>Withdrawal Period</span>

        {{ share.shareType?.withdrawalLimitPeriod ?? 'UNKNOWN' }}
      </p>

      <p class="share-info__item">
        <span>Withdrawals this Period</span>
        {{ share.limitedWithdrawalCount ?? 0 }}
      </p>

      <template v-if="share.shareType?.withdrawalLimitShouldFee ?? false">
        <p class="share-info__item">
          <span>Excessive Withdrawal Fee</span>

          {{
            new Intl.NumberFormat(
              'en-US',
              {
                style: 'currency',
                currency: 'USD',
              }
            ).format(share.shareType?.withdrawalLimitFee ?? 0)
          }}
        </p>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

// Composables
import useShareName from '../composables/useShareName';

export default defineComponent({
  props: {
    share: {
      type: Object as PropType<Share|null>,
      default: null,
    },
  },
  setup(props) {
    const { name } = useShareName(() => props.share);

    return {
      name,
    };
  },
});
</script>

<style lang="scss">
  .share-info {
    display: flex;
    flex-direction: column;

    &.flex p {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      span::after {
        content: '';
      }
    }

    &.banded p:nth-child(odd) {
      background-color: colorStep(primary, $step: 2);
    }

    &__item:first-of-type {
      margin-top: 0.25em;
    }

    &__item {
      margin-left: 0.25em;

      span::after {
        content: ':';
        margin-right: 0.25em;
      }

      &--focused {
        font-weight: bold;
      }
    }
  }
</style>
