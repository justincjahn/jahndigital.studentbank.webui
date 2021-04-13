<template>
  <h1>StudentBank</h1>
  <router-view />
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  props: {
    msg: {
      type: String,
      default: '',
    },
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

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
