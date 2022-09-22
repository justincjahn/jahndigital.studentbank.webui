<script lang="ts" setup>
import { ref } from 'vue';
import { VSelect, VOption, VDivider } from '@/common/components/inputs/select';

import '@/common/styles/common.css';

const test = ref(null);
</script>

<template>
  <h1>Vue App!</h1>
  <v-select v-model="test">
    <v-option value="1" />
    <v-option value="2" disabled />
    <v-option value="3" />
    <v-divider />
    <v-option value="4" />
    <v-option value="5" />
    <v-option value="6" />
  </v-select>
</template>
