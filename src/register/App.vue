<script setup lang="ts">
import '@/common/styles/common.css';
</script>

<template>
  <header class="main-header">
    <div class="container | flex-group">
      <h1>Site Name</h1>
      <p>Logout Link</p>
    </div>
  </header>

  <div class="container section">
    <nav class="sub-nav | flex-group" data-flex-type="start">
      <a href="#">Link 1</a>
      <a href="#">Link 2</a>
      <a href="#">Link 3</a>
      <a href="#">Link 4</a>
    </nav>
  </div>

  <main class="main-content">
    <div class="container">Contained</div>
  </main>

  <footer class="main-footer">Footing</footer>
</template>
