<script lang="ts" setup>
import { query } from '@/common/services/apollo.ts';
import test from '@/common/graphql/queries/currentUser.gql';

query(test);
</script>

<template>
  <h1>Vue App!</h1>
</template>
