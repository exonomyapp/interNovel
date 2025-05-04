<template>
  <div>
    <NuxtLayout>
      <NuxtPage /> <!-- Renders the current page (e.g., pages/index.vue) -->
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// No script needed here anymore
</script>

<style>
/* Global styles can remain or be moved */
body {
  font-family: sans-serif;
  margin: 0; /* Remove default body margin */
}
main {
  margin-top: 1rem;
}
</style>
