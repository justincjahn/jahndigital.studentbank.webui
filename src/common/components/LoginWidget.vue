<script lang="ts" setup>
import type { UserStore } from '@/common/stores/user';
import { computed } from 'vue';

const props = defineProps<{
  store: UserStore;
}>();

const username = computed(() =>
  props.store.email.value ? props.store.email.value : props.store.username.value
);

const isAuthenticated = computed(() => props.store.isAuthenticated.value);
const logout = () => props.store.logout();
</script>

<template>
  <template v-if="isAuthenticated">
    {{ username }}
    (<a href="#" @click="logout">Logout</a>)
  </template>
</template>
