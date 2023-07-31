<script setup lang="ts">
import type { Student } from '@/common/services/student';

// Components
import StudentSelectorStudentShare from './StudentSelectorStudentShare.vue';

defineProps<{
  modelValue: Student;
}>();
</script>

<template>
  <div class="wrapper">
    <span class="account-number">
      {{ modelValue.accountNumber }}
    </span>

    <span class="name">
      {{ modelValue.lastName }}, {{ modelValue.firstName }}
    </span>

    <span
      v-if="modelValue.email && modelValue.email.trim().length > 0"
      class="email"
    >
      {{ modelValue.email }}
    </span>

    <ul
      v-if="modelValue.shares && modelValue.shares.length > 0"
      class="share-list"
    >
      <student-selector-student-share
        v-for="share of modelValue.shares"
        :key="share.id"
        :model-value="share"
      />
    </ul>
  </div>
</template>

<style scoped>
.wrapper {
  font-size: 0.9em;
}

.account-number {
  font-family: Consolas, 'Courier New', Courier, monospace;
}

.account-number::after {
  content: ' ';
}

.email {
  display: block;
}

.share-list {
  list-style: none;
  margin-top: 0.5em;
}
</style>
