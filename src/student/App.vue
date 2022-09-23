<script lang="ts" setup>
import { ref } from 'vue';
import { VSelect, VOption, VDivider } from '@/common/components/inputs/select';

import '@/common/styles/common.css';

const test = ref(null);

const items = ref([1, 2, 3, 4, 5, 6]);

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
</script>

<template>
  <h1>Vue App!</h1>
  <!-- <v-select>
    <v-option value="1" />
    <v-option value="2" disabled />
    <v-option value="3" @click="onClick" />
    <v-divider />
    <v-option value="4" />
    <v-option value="5" />
    <v-option value="6" />
  </v-select> -->

  <v-select v-model="test">
    <v-option v-for="(item, i) in items" :key="i" :value="item" />
    <v-divider />
    <div class="additional_options">
      <v-option value="ADD_USER" @click="onAddUser" />
    </div>
  </v-select>

  <button type="button" @click="add">Add</button>
  <button type="button" @click="remove">Remove</button>
  <button type="button" @click="splice">Splice</button>
  <button type="button" @click="update">Update</button>
</template>
