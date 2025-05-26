<template>
  <v-app>
    <div class="x-style-app">
      <!-- Top navbar -->
      <header class="x-header">
        <div class="x-container">
          <div class="x-header-content">
            <h1 class="app-title">Issue Manager</h1>
            
            <div class="header-actions">
              <!-- User section - moved GitHub sign-in button to sidebar -->
              <div v-if="isAuthenticated" class="user-section">
                <v-menu location="bottom end" transition="slide-y-transition">
                  <template v-slot:activator="{ props }">
                    <div class="user-trigger" v-bind="props">
                      <v-avatar size="32" class="user-avatar">
                        <v-img :src="userAvatar" alt="User Avatar" />
                      </v-avatar>
                      <span class="username d-none d-sm-inline">{{ userName }}</span>
                      <v-icon size="small" class="d-none d-sm-inline">mdi-chevron-down</v-icon>
                    </div>
                  </template>
                  
                  <v-card min-width="200" class="x-menu-card">
                    <v-list density="compact">
                      <v-list-item @click="viewProfile" class="x-menu-item">
                        <template v-slot:prepend>
                          <v-icon size="small">mdi-account</v-icon>
                        </template>
                        <v-list-item-title>Profile</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item @click="logout" class="x-menu-item">
                        <template v-slot:prepend>
                          <v-icon size="small">mdi-logout</v-icon>
                        </template>
                        <v-list-item-title>Logout</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div class="x-main-layout">
        <!-- Left sidebar -->
        <aside class="x-sidebar">
          <div class="sidebar-content">
            <!-- User controls at top -->
            <section class="sidebar-section">
              <Users 
                :is-authenticated="isAuthenticated" 
                @login="loginWithGitHub" 
                @logout="logout"
                @settings="showSettings" 
              />
            </section>

            <v-spacer></v-spacer>
            
            <!-- Actions at bottom -->
            <section class="sidebar-section">
              <Actions />
            </section>
          </div>
        </aside>
        
        <!-- Main content area -->
        <main class="x-main-content">
          <slot />
        </main>
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventBus, EVENTS } from '../composables/useEventBus';
import Actions from '../components/Actions.vue';
import Users from '../components/Users.vue';

// Event bus
const { emit } = useEventBus();

// GitHub auth state
const isAuthenticated = ref(false);
const userName = ref('');
const userAvatar = ref('');

// Auth methods
const loginWithGitHub = () => {
  // Just emit the login event, actual login is handled by Users component
  console.log('Login initiated from layout');
};

const logout = () => {
  isAuthenticated.value = false;
  userName.value = '';
  userAvatar.value = '';
  localStorage.removeItem('github_access_token');
};

const viewProfile = () => {
  // View profile action
  console.log('View profile clicked');
};

// Actions
const createNewIssue = () => {
  emit(EVENTS.SHOW_CREATE_FORM);
};

const reloadData = () => {
  emit(EVENTS.RELOAD_DATA);
};

const showSettings = () => {
  console.log('Settings clicked');
};

// Initialize on mount
onMounted(async () => {
  const token = localStorage.getItem('github_access_token');
  if (token) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        isAuthenticated.value = true;
        userName.value = data.login;
        userAvatar.value = data.avatar_url;
      } else {
        // If token is invalid, remove it
        localStorage.removeItem('github_access_token');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('github_access_token');
    }
  }
});
</script>

<style scoped>
.x-style-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.x-header {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(0,0,0,0.12);
  padding: 8px 16px;
}

.x-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.x-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.x-main-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100%;
}

.x-sidebar {
  border-right: 1px solid rgba(0,0,0,0.12);
  background: rgb(var(--v-theme-surface));
  height: 100%;
  overflow-y: auto;
}

.x-main-content {
  height: 100%;
  overflow-y: auto;
}

.sidebar-content {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  margin-bottom: 16px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.user-trigger:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.x-menu-card {
  border-radius: 8px;
  overflow: hidden;
}

.x-menu-item {
  min-height: 40px;
}
</style>