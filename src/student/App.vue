<script lang="ts" setup>
import { ref } from 'vue';

import {
  VInput,
  VSelect,
  VOption,
  VDivider,
  VCheckbox,
  VCurrency,
} from '@/common/components/inputs';

import ModalDialog from '@/common/components/ModalDialog.vue';

import '@/common/styles/common.css';
import Money, { IMoney } from '@/common/utils/Money';

const test = ref(null);

const show = ref(false);

const items = ref([1, 2, 3, 4, 5, 6]);

const dollars = ref<IMoney>(Money.fromNumber(0));

function add() {
  items.value.push(items.value.length + 1);
}

function remove() {
  items.value.pop();
}

function splice() {
  items.value.splice(1, 1);
}

function update() {
  items.value[0] += 1;
}

function onAddUser() {
  console.log('!!!');
}

function toggleModal() {
  show.value = !show.value;
}
</script>

<template>
  <h1>Vue App!</h1>

  <v-select v-model="test" name="test">
    <v-option v-for="(item, i) in items" :key="i" :value="item" />
    <v-divider />
    <v-option value="ADD_USER" @click="onAddUser" />
  </v-select>

  <button type="button" @click="add">Add</button>
  <button type="button" @click="remove">Remove</button>
  <button type="button" @click="splice">Splice</button>
  <button type="button" @click="update">Update</button>

  <button type="button" @click="toggleModal">Show Modal</button>

  <modal-dialog
    :show="show"
    title="Test Modal"
    cancel-label="Cancel"
    @cancel="toggleModal"
    @submit="toggleModal"
  >
    <v-input name="test-input" label="Testing" required />
  </modal-dialog>

  <v-input
    name="another-test-input"
    label="Test Input"
    type="number"
    min="0"
    max="100"
    required
  />

  <v-checkbox v-model="show" name="another-text-input-01" label="Check me" />

  <form>
    <v-currency v-model="dollars" label="Gimme" :allow-zero="false" required />
  </form>

  {{ dollars.toString() }}
</template>
