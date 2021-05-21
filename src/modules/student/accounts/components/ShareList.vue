<template>
  <div class="share-list">
    <div
      v-for="share in shares"
      :key="share.id"
      class="share-list__item"
    >
      <div class="share-list__item--wrapper">
        <router-link
          :to="{ name: transactionRoute, params: { shareId: share.id } }"
          class="share-list__item--name"
        >
          {{ share.shareType.name }} ({{ accountNumber }}S{{ share.id }})
        </router-link>

        <span class="share-list__item--balance">
          Available Balance:

          {{
            new Intl.NumberFormat(
              'en-US',
              {
                style: 'currency',
                currency: 'USD',
              }
            ).format(share.balance)
          }}
        </span>
      </div>

      <button
        type="button"
        class="secondary share-list__item--transfer"
        @click.prevent="startTransfer(share)"
      >
        Transfer
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

// Stores
import userStore from '@/store/user';

// Route Names
import AccountsRouteNames from '../routeNames';

export default defineComponent({
  props: {
    shares: {
      type: Object as PropType<Share[]>,
      required: true,
    },
  },
  emits: [
    'start-transfer',
  ],
  setup(props, { emit }) {
    function startTransfer(share: Share) {
      emit('start-transfer', share);
    }

    return {
      accountNumber: userStore.username,
      transactionRoute: AccountsRouteNames.transactions,
      startTransfer,
    };
  },
});
</script>

<style lang="scss">
.share-list {
  width: 100%;
  margin-bottom: 2em;
  padding: 1em;
  background-color: colorStep(secondary);

  &__item {
    display: flex;
    flex-direction: column;
    margin: 0 auto;

    @media (min-width: 800px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
    }

    & + & {
      margin-top: 1em;
      border-top: 1px dotted rgba(0,0,0,0.1);
    }

    &--name {
      width: 100%;
      display: block;
      font-size: 1.15em;
      font-weight: bold;

      // font-family: 'Consolas', 'Courier New', Courier, monospace;
      text-decoration: none;
    }

    &--balance {
      width: 100%;
      display: block;
      text-align: left;
    }

    &--transfer {
      margin-top: 1.5em;

      @media (min-width: 800px) {
        margin: 0;
      }
    }
  }
}
</style>
