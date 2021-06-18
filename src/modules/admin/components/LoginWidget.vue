<template>
  <template v-if="isAuthenticated">
    {{ username }}
    (<a href="#" @click="logout">Logout</a>)
  </template>
  <template v-else>
    <router-link :to="{name: LoginRouteNames.index }">
      Login
    </router-link>
  </template>
</template>

<script>
// Routes
import LoginRouteNames from '@/modules/admin/login/routeNames';

// Stores
import userStore from '@/stores/user';

// Services
import { logout as userLogout } from '@/services/auth';

export default {
  setup() {
    const logout = () => userLogout();

    return {
      ...userStore,
      LoginRouteNames,
      logout,
    };
  },
};
</script>
