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
            <!-- User authentication section -->
            <section class="sidebar-section">
              <Users 
                :isAuthenticated="isAuthenticated" 
                @login="loginWithGitHub" 
                @settings="showSettings" 
              />
            </section>
            
            <!-- Actions component positioned at the bottom -->
            <section class="sidebar-section actions-section">
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

// GitHub auth state (mock for now, would connect to real auth system)
const isAuthenticated = ref(false);
const userName = ref('GitHub User');
const userAvatar = ref('https://avatars.githubusercontent.com/u/583231?v=4'); // Default GitHub octocat

// Auth methods
const loginWithGitHub = () => {
  // Mock GitHub authentication - would be replaced with actual OAuth flow
  isAuthenticated.value = true;
  userName.value = 'Demo User';
};

const logout = () => {
  isAuthenticated.value = false;
};

const viewProfile = () => {
  // View profile action
  console.log('View profile clicked');
};

// Actions
const createNewIssue = () => {
  // This will trigger any listening components to show the create form
  emit(EVENTS.SHOW_CREATE_FORM);
};

const reloadData = () => {
  // This will trigger a reload of the main data
  emit(EVENTS.RELOAD_DATA);
};

const showSettings = () => {
  // This would open a settings dialog
  console.log('Settings clicked');
};

// Initialize on mount
onMounted(() => {
  // Any initialization logic needed
});
</script>

<!-- Removed <style scoped> block; styles are now in assets/styles/6-components/_layout-default.scss -->