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
        :class="{ selected: share.id === modelValue?.id ?? false }"
        @click="selectShare(share)"
      >
        <th>{{ share.shareType?.name ?? 'Unknown' }}</th>
        <td>
          {{
            new Intl.NumberFormat(
              'en-US',
              {
                style: 'currency',
                currency: 'USD',
              }
            ).format(share.balance)
          }}
        </td>
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
    modelValue: {
      type: Object as () => Share|null,
      default: null,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(_, { emit }) {
    function selectShare(share: Share) { emit('update:modelValue', share); }
    return { selectShare };
  },
});
</script>

<style lang="scss">
.share-list { @include table(); }
</style>
