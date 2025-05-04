<template>
  <div class="users-component">
    <h3 class="users-title">User Controls</h3>
    
    <div class="users-grid">
      <!-- GitHub login button for non-authenticated users -->
      <v-btn
        v-if="!isAuthenticated"
        color="primary"
        prepend-icon="mdi-github"
        @click="loginWithGitHub"
        class="user-btn"
        block
      >
        Sign in with GitHub
      </v-btn>
      
      <!-- Settings button - always visible, but disabled when not authenticated -->
      <v-btn 
        color="secondary" 
        class="user-btn settings-btn"
        prepend-icon="mdi-cog"
        variant="tonal"
        @click="showSettings"
        :disabled="!isAuthenticated"
        block
      >
        Settings
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['login', 'settings']);

// Methods
const loginWithGitHub = () => {
  emit('login');
};

const showSettings = () => {
  emit('settings');
};
</script>

<style scoped>
.users-component {
  width: 100%;
}

.users-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: rgb(var(--v-theme-on-surface));
}

.users-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  width: 100%;
}

.user-btn {
  width: 100%;
  border-radius: 20px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: normal;
}

/* Ensure the settings button remains visible when disabled in dark mode */
.settings-btn:disabled {
  opacity: 0.8 !important;
  background-color: rgba(var(--v-theme-secondary), 0.3) !important;
  color: rgba(var(--v-theme-on-secondary), 0.7) !important;
}

/* Ensure the settings icon remains visible when the button is disabled */
.settings-btn:disabled .v-btn__prepend {
  opacity: 0.8 !important;
  color: rgba(var(--v-theme-on-secondary), 0.7) !important;
}
</style>