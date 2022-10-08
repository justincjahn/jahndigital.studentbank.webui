<script lang="ts" setup>
import { computed } from 'vue';
import type { ShareType } from '@/admin/common/services/shareType';
import ShareTypeAddEditForm from './ShareTypeAddEditForm.vue';
import { buildFormData } from './useShareTypeForm';

const props = defineProps<{
  selected: ShareType | null;
  valid: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:valid', value: boolean): void;
}>();

const valid = computed({
  get: () => props.valid,
  set: (value) => emit('update:valid', value),
});

const formData = buildFormData();
</script>

<template>
  <form class="stlum" @submit.prevent>
    <h2>Create a new Share Type</h2>
    <share-type-add-edit-form v-model="formData" v-model:valid="valid" />
    <button type="submit" class="primary">Create</button>
  </form>
</template>

<style scoped>
.stlum {
  margin: 1em;
  padding: 1em;
  border: 1px solid hsl(var(--clr-neutral-500));
  border-radius: var(--border-radius);
}

.stlum h2 {
  margin-bottom: 0.5em;
}

.stlum button {
  width: 100%;
  margin: 0;
  margin-top: 2em;
}
</style>
