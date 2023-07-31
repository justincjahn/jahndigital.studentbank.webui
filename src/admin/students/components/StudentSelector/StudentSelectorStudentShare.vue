<script setup lang="ts">
import { computed } from 'vue';

// Types
import type { Share } from '@/common/services/share';

// Utils
import Money from '@/common/utils/Money';

const props = defineProps<{
  modelValue: Share;
}>();

const slug = computed(() => {
  if (!props.modelValue.shareType) return 'UNK';
  return props.modelValue.shareType.name.substring(0, 3).toUpperCase();
});

const amount = computed(() => {
  return Money.fromNumber(props.modelValue.balance ?? 0);
});
</script>

<template>
  <li class="student-selector-student__share">{{ slug }}: {{ amount }}</li>
</template>
