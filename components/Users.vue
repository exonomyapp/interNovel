<template>
  <div class="users-component">
    <h3 class="users-title">User Controls</h3>

    <div class="users-grid">
      <div v-if="isAuthenticated" class="user-info">
        <div class="avatar-container">
          <v-avatar size="40">
            <v-img :src="userAvatar" alt="User Avatar" />
          </v-avatar>
        </div>
        <v-btn
          color="error"
          prepend-icon="mdi-logout"
          class="user-btn"
          @click="logout"
          variant="tonal"
          block
        >
          Logout
        </v-btn>
      </div>

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

    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Your GitHub Repositories
              <v-spacer></v-spacer>
              <v-btn
                v-if="!loading"
                icon="mdi-refresh"
                @click="fetchRepositories"
                :disabled="!isAuthenticated"
              ></v-btn>
              <v-progress-circular
                v-else
                indeterminate
                size="24"
              ></v-progress-circular>
            </v-card-title>
            
            <v-card-text>
              <div v-if="!isAuthenticated" class="text-center pa-4">
                Please sign in with GitHub to view your repositories.
              </div>
              
              <div v-else-if="error" class="text-center pa-4 text-error">
                {{ error }}
              </div>
              
              <v-list v-else>
                <v-list-item
                  v-for="repo in repositories"
                  :key="repo.id"
                  :title="repo.name"
                  :subtitle="repo.description || 'No description'"
                >
                  <template v-slot:append>
                    <v-chip
                      :color="repo.private ? 'error' : 'success'"
                      size="small"
                    >
                      {{ repo.private ? 'Private' : 'Public' }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useGithub } from '~/composables/useGithub';

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['login', 'settings', 'logout']);

const userAvatar = ref('');

const {
  repositories,
  loading,
  error,
  fetchRepositories
} = useGithub();

// Watch for authentication state changes
watch(() => props.isAuthenticated, async (newValue) => {
  if (newValue) {
    await fetchUserAvatar();
  } else {
    userAvatar.value = '';
  }
}, { immediate: true });

onMounted(async () => {
  if (props.isAuthenticated) {
    await fetchUserAvatar();
    await fetchRepositories();
  }
});

const fetchUserAvatar = async () => {
  const token = localStorage.getItem('github_access_token');
  if (!token) return;
  
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const data = await response.json();
    userAvatar.value = data.avatar_url;
  } catch (error: any) {
    console.error('Error fetching user avatar:', error);
    // If we get an error fetching the avatar, we might want to log out
    // as it could mean the token is invalid
    if (error.message?.includes('401')) {
      logout();
    }
  }
};

const loginWithGitHub = () => {
  emit('login');
  const clientId = 'Ov23liMrCpSFajxWzoYp';
  const redirectUri = `${window.location.origin}/auth/callback`;
  const scope = 'repo user';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  window.location.href = authUrl;
};

const logout = () => {
  localStorage.removeItem('github_access_token');
  emit('logout');
  userAvatar.value = '';
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

.settings-btn:disabled {
  opacity: 0.8 !important;
  background-color: rgba(var(--v-theme-secondary), 0.3) !important;
  color: rgba(var(--v-theme-on-secondary), 0.7) !important;
}

.user-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}
</style>
