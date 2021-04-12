<template>
  <template v-if="userStore.isAuthenticated.value">
    {{ userStore.username.value }}
    (<a href="#" @click="logout">Logout</a>)
  </template>
  <template v-else>
    <router-link :to="{name: LoginRouteNames.index }">
      Login
    </router-link>
  </template>
</template>

<script>
import { RouteNames as LoginRouteNames } from '@/modules/admin/login/routes';
import userStore from '@/store/user';
import AuthenticationService from '@/services/AuthenticationService';
import Apollo from '@/services/Apollo';

const auth = new AuthenticationService(Apollo);

export default {
  setup() {
    const logout = () => auth.logout();

    return {
      LoginRouteNames,
      userStore,
      logout,
    };
  },
};
</script>
