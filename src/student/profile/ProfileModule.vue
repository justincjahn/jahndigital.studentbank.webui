<script setup lang="ts">
import ProfileRouteNames from '@/student/profile/routeNames';
</script>

<template>
  <div class="sub-menu sub-nav">
    <div class="container | flex-group" data-flex-type="start">
      <router-link :to="{ name: ProfileRouteNames.profile }">
        My Profile
      </router-link>

      <router-link :to="{ name: ProfileRouteNames.password }">
        Change Password
      </router-link>
    </div>
  </div>

  <router-view />
</template>
