<script setup lang="ts">
import StocksRouteNames from '@/student/stocks/routeNames';
</script>

<template>
  <div class="sub-menu sub-nav">
    <div class="container | flex-group" data-flex-type="start">
      <router-link :to="{ name: StocksRouteNames.portfolio }">
        My Portfolio
      </router-link>

      <router-link :to="{ name: StocksRouteNames.available }">
        Available Stocks
      </router-link>
    </div>
  </div>

  <router-view />
</template>
