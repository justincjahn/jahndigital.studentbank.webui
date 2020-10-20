<template>
  <div class="hello">
    <h1>{{msg}}</h1>
    <p>{{count}}</p>
    <p><button @click="increment">Add</button></p>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  props: {
    msg: String,
  },

  setup() {
    const count = ref(0);

    function increment() {
      count.value += 1;
    }

    return {
      count,
      increment,
    };
  },
};
</script>
