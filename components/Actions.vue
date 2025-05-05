<template>
  <div class="actions-component">
    <h3 class="actions-title">Actions</h3>
    
    <div class="actions-grid">
      <!-- Dark mode toggle button -->
      <v-btn
        color="default"
        class="action-btn"
        prepend-icon="mdi-weather-night"
        variant="tonal"
        @click="toggleDarkMode"
      >
        {{ darkMode ? 'Light mode' : 'Dark mode' }}
      </v-btn>
      
      <v-btn 
        color="primary" 
        class="action-btn"
        prepend-icon="mdi-refresh"
        variant="tonal"
        @click="reloadData"
      >
        Reload
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEventBus, EVENTS } from '../composables/useEventBus';
import { useTheme } from 'vuetify';

// Event bus
const { emit } = useEventBus();

// Vuetify theme
const theme = useTheme();

// Theme state
const darkMode = ref(true);

// Actions
const reloadData = () => {
  emit(EVENTS.RELOAD_DATA);
};

// Theme toggle
const toggleDarkMode = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
  darkMode.value = !darkMode.value;
};

// Initialize theme on mount (will be added to onMounted hook if added)
</script>

<style scoped>
.actions-component {
  width: 100%;
}

.actions-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: rgb(var(--v-theme-on-surface));
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  width: 100%;
}

.action-btn {
  width: 100%;
  border-radius: 20px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: normal;
}
</style>