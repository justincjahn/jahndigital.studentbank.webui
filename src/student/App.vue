<script lang="ts" setup>
import userStore from '@/common/stores/user';

// setTimeout(() => userStore.login('admin@domain.tld', 'admin'), 3000);
// userStore.logout();
</script>

<template>
  <h1>Vue App!</h1>
  <p v-if="userStore.tokenStore.isAnonymous.value">Not Logged In</p>
  <p v-else>{{ userStore.email.value }}</p>
</template>
