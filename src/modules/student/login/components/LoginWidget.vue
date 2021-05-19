<template>
  <template v-if="isAuthenticated">
    <span v-if="email">
      {{ email }}
    </span>
    <span v-else>
      {{ username }}
    </span>

    <span class="logout">
      (<a href="#" @click="logout">Logout</a>)
    </span>
  </template>
  <template v-else>
    <router-link :to="{name: LoginRouteNames.index }">
      Login
    </router-link>
  </template>
</template>

<script>
// Stores
import userStore from '@/store/user';

// Services
import { logout as studentLogout } from '@/services/auth';

// Routes
import LoginRouteNames from '../routeNames';

export default {
  setup() {
    const logout = () => studentLogout();

    return {
      ...userStore,
      LoginRouteNames,
      logout,
    };
  },
};
</script>
