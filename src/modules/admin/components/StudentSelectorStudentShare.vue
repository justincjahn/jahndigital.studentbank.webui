<template>
  <li class="student-selector-student-share">
    {{ slug }}: {{ amount }}
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';

export default defineComponent({
  props: {
    share: {
      type: Object as PropType<Share>,
      required: true,
    },
  },
  setup(props) {
    const slug = computed(() => {
      if (!props.share.shareType) return 'UNK';
      return props.share.shareType.name.substring(0, 3).toUpperCase();
    });

    const amount = computed(() => (
      new Intl.NumberFormat(
        'en-US',
        {
          style: 'currency',
          currency: 'USD',
        },
      ).format(props.share.balance)
    ));

    return {
      slug,
      amount,
    };
  },
});
</script>
