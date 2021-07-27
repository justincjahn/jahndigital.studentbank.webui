<template>
  <div class="share-list">
    <p class="share-list--help help-text">
      Select an Account from the list below to view transaction history or click Transfer
      to move funds into another account.
    </p>
    <div
      v-for="share in shares"
      :key="share.id"
      class="share-list__item"
    >
      <div class="share-list__item__info">
        <share-info :share="share">
          <template #default="{ shareName, share: sh }">
            <router-link
              :to="{ name: transactionRoute, params: { shareId: sh.id } }"
              class="share-list__item__info--name"
            >
              {{ shareName }}
            </router-link>
          </template>
        </share-info>

        <button
          type="button"
          class="secondary share-list__item__info--transfer"
          @click.prevent="startTransfer(share)"
        >
          Transfer
        </button>
      </div>

      <suspense>
        <transaction-list
          v-if="share.id == selected?.id ?? -1"
          class="share-list__item__transactions"
        />
      </suspense>
    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';

// Components
import ShareInfo from '../../components/ShareInfo.vue';

// Route Names
import AccountsRouteNames from '../routeNames';

export default defineComponent({
  components: {
    ShareInfo,
    TransactionList: defineAsyncComponent(() => import('./TransactionList.vue')),
  },
  props: {
    shares: {
      type: Object as PropType<Share[]>,
      required: true,
    },
    selected: {
      type: Object as PropType<Share|null>,
      default: null,
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
      transactionRoute: AccountsRouteNames.index,
      startTransfer,
    };
  },
});
</script>

<style lang="scss">
.share-list {
  background-color: colorStep(secondary);

  & &--help { // Specificity
    padding: 1em;
  }

  &__item__info {
    margin: 0 1em;
    padding-bottom: 1em;
    display: flex;
    flex-direction: column;

    @media (min-width: 800px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
    }

    &--name {
      position: relative;
      width: 100%;
      display: block;
      font-size: 1.125em;
      font-weight: 600;
      text-decoration: none;

      &::after {
        position: absolute;
        width: 32px;
        margin-left: 0.25rem;
        top: -0.415em;
        font-size: 2em;
        content: '\1F892';
      }
    }

    &--transfer {
      margin-top: 1.5em;

      @media (min-width: 800px) {
        margin: 0;
      }
    }
  }

  &__item + &__item {
    padding-top: 0.5em;
    margin-top: 0.5em;
    border-top: 1px dotted rgba(0,0,0,0.1);
  }

  &__item__transactions {
    padding: 1em;
    background-color: #FFF;
  }
}
</style>
