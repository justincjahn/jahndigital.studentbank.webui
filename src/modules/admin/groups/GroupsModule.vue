<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue';

import injectStrict from '@/utils/injectStrict';
import { INSTANCE_STORE_SYMBOL } from '@/modules/admin/symbols';
import { GROUP_STORE_SYMBOL } from './symbols';
import { setup as defineGroupStore } from './stores/group';

export default defineComponent({
  setup() {
    const instanceStore = injectStrict(INSTANCE_STORE_SYMBOL);
    const groupStore = defineGroupStore(instanceStore);
    provide(GROUP_STORE_SYMBOL, groupStore);
  },
});
</script>
