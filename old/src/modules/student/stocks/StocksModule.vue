<template>
  <section class="sub-nav sub-nav--padded">
    <router-link :to="{ name: holdingsRoute }">
      My Portfolio
    </router-link>

    <router-link :to="{ name: availableRoute }">
      Available Stocks
    </router-link>
  </section>

  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StocksRouteNames from './routeNames';

export default defineComponent({
  setup() {
    return {
      holdingsRoute: StocksRouteNames.holdings,
      availableRoute: StocksRouteNames.available,
    };
  },
});
</script>
