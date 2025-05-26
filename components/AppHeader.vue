<template>
  <header class="gh-header-main">
    <div class="header-content">
      <!-- Left side -->
      <div class="d-flex align-center">
        <v-icon icon="mdi-source-repository" size="24" class="mr-2" color="var(--gh-fg-muted)" />
        <span class="gh-title">Issue Manager</span>
      </div>

      <!-- Right side -->
      <div class="d-flex align-center">
        <!-- Theme Toggle -->
        <v-btn
          icon
          variant="text"
          size="small"
          class="gh-button mr-2"
          @click="toggleTheme"
        >
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <!-- Settings -->
        <v-btn
          icon
          variant="text"
          size="small"
          class="gh-button mr-4"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>

        <!-- User Section -->
        <template v-if="isAuthenticated">
          <v-menu>
            <template v-slot:activator="{ props }">
              <div class="user-avatar" v-bind="props">
                <v-avatar size="32" color="var(--gh-bg-subtle)">
                  <v-img v-if="userAvatar" :src="userAvatar" />
                  <v-icon v-else>mdi-account</v-icon>
                </v-avatar>
                <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
              </div>
            </template>

            <v-list class="gh-box py-2" density="compact">
              <v-list-item
                prepend-icon="mdi-account"
                :title="userName || 'User'"
                subtitle="View profile"
                class="gh-list-item"
              ></v-list-item>
              <v-divider class="my-2"></v-divider>
              <v-list-item
                prepend-icon="mdi-logout"
                title="Sign out"
                class="gh-list-item"
                @click="handleLogout"
              ></v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- Login Button -->
        <template v-else>
          <v-btn
            class="gh-button primary"
            prepend-icon="mdi-github"
            @click="loginWithGitHub"
            :loading="loading"
          >
            Sign in with GitHub
          </v-btn>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { useGithub } from '~/composables/useGithub';

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

const { isAuthenticated, userAvatar, userName, loading, logout } = useGithub();

// Theme toggle
function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark';
}

const loginWithGitHub = () => {
  window.location.href = 'https://github.com/login/oauth/authorize?client_id=Ov23liMrCpSFajxWzoYp&redirect_uri=http://localhost:3001/auth/callback&scope=repo,user';
};

const handleLogout = () => {
  logout();
  // Optionally redirect to home or refresh the page
  window.location.href = '/';
};
</script>

<style scoped>
.gh-header-main {
  height: 64px;
  background-color: var(--gh-bg-default);
  border-bottom: 1px solid var(--gh-border-default);
  padding: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.user-avatar:hover {
  background-color: var(--gh-bg-subtle);
}

:deep(.v-list) {
  background-color: var(--gh-bg-default) !important;
  color: var(--gh-fg-default) !important;
}

:deep(.v-list-item) {
  min-height: 32px !important;
}

:deep(.v-list-item:hover) {
  background-color: var(--gh-bg-subtle) !important;
}

:deep(.v-divider) {
  border-color: var(--gh-border-muted) !important;
}
</style> 