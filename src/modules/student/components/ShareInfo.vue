<template>
  <div v-if="share" class="share-info">
    <slot :shareName="name" :share="share">
      <h3 class="share-info__name">
        {{ name }}
      </h3>
    </slot>

    <p class="share-info__item">
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

    &__item {
      span {
        font-weight: 100;
      }

      span::after {
        content: ':';
        margin-right: 0.25em;
      }
    }
  }
</style>
