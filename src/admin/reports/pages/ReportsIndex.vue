<script setup lang="ts">
import ReportRouteNames from '../routeNames';
</script>

<template>
  <section>
    <header>
      <h1>Available Reports</h1>
    </header>

    <ul>
      <li>
        <router-link :to="{ name: ReportRouteNames.groupStatistics }">
          Group Statistics
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: ReportRouteNames.studentStatistics }">
          Student Statistics
        </router-link>
      </li>
    </ul>
  </section>
</template>

<style scoped>
section {
  margin-inline: 0.5rem;
}

section ul {
  margin-inline-start: 1.5rem;
}
</style>
