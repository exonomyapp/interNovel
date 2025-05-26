<template>
  <div>
    <v-app :theme="theme">
      <AppHeader />
      <v-main>
        <NuxtPage />
      </v-main>
    </v-app>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import AppHeader from './components/AppHeader.vue';

const theme = ref('light');
const vuetifyTheme = useTheme();

// Watch for system theme changes
onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const updateTheme = (e) => {
    theme.value = e.matches ? 'dark' : 'light';
  };
  
  mediaQuery.addEventListener('change', updateTheme);
  updateTheme(mediaQuery);
  
  // Cleanup
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', updateTheme);
  });
});

// Update data-theme attribute for GitHub theme
watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
  vuetifyTheme.global.name.value = newTheme;
});
</script>

<style>
@import '@/assets/styles/github-theme.css';

html, body {
  margin: 0;
  padding: 0;
  font-family: var(--gh-font-sans);
  background-color: var(--gh-bg-canvas);
  color: var(--gh-fg-default);
}

:root {
  color-scheme: light dark;
}

/* Adjust main content to account for header */
.v-main {
  padding-top: 0 !important;
}

.v-application {
  background-color: var(--gh-bg-default) !important;
  color: var(--gh-fg-default) !important;
}

.v-main {
  background-color: var(--gh-bg-default) !important;
}
</style>
