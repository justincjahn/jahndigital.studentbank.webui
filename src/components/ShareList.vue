<template>
  <table class="share-list">
    <thead>
      <tr>
        <th>Name</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="share in shares"
        :key="share.id"
        @click="selectShare(share)"
        :class="{ selected: share.id === selected?.id ?? false }"
      >
        <th>{{share.shareType.name}}</th>
        <td>{{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(share.balance)
        }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    shares: {
      type: Object as () => Share[],
      required: true,
    },
    selected: {
      type: Object as () => Share|null,
      required: false,
      default: null,
    },
  },
  setup(_, { emit }) {
    function selectShare(share: Share) {
      emit('select', share);
    }

    return {
      selectShare,
    };
  },
});
</script>

<style lang="scss">
.share-list { @include table(); }
</style>
