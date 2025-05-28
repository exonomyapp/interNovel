<template>
  <div class="auth-callback">
    <v-container>
      <v-row justify="center" align="center" style="height: 100vh;">
        <v-col cols="12" sm="8" md="6">
          <v-card class="pa-4">
            <v-card-text class="text-center">
              <div v-if="loading">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="mt-4">Authenticating with GitHub...</div>
              </div>
              <div v-else-if="error" class="text-error">
                <v-alert
                  type="error"
                  title="Authentication Error"
                  :text="error"
                  class="mb-4"
                ></v-alert>
                <v-btn
                  color="primary"
                  @click="retryAuth"
                  class="mt-4"
                >
                  Try Again
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useGithub } from '~/composables/useGithub';

const loading = ref(true);
const error = ref<string | null>(null);
const route = useRoute();
const { initialize } = useGithub();

const handleAuth = async () => {
  const code = route.query.code;
  const state = route.query.state;
  const savedState = localStorage.getItem('github_oauth_state');
  
  console.log('Callback received:', {
    code,
    state,
    savedState,
    query: route.query
  });
  
  // Verify state parameter
  if (!state || !savedState || state !== savedState) {
    console.error('State mismatch:', { state, savedState });
    error.value = 'Invalid state parameter. Please try signing in again.';
    loading.value = false;
    return;
  }
  
  // Clear the state from localStorage
  localStorage.removeItem('github_oauth_state');

  if (!code) {
    console.error('No code received');
    error.value = 'No authorization code found in the URL. Please try signing in again.';
    loading.value = false;
    return;
  }

  try {
    console.log('Exchanging code for token...');
    // Exchange the code for a token
    const response = await fetch('/api/auth/github-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token exchange failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Token exchange successful:', { hasToken: !!data.access_token });
    
    if (data.access_token) {
      console.log('Token received successfully');
      // Save the token
      localStorage.setItem('github_access_token', data.access_token);
      // Initialize GitHub composable
      initialize();
      // Redirect to home page
      window.location.href = '/';
    } else {
      throw new Error('No access token received from GitHub');
    }
  } catch (err) {
    console.error('Authentication error:', err);
    error.value = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

const retryAuth = () => {
  window.location.href = '/api/auth/login';
};

onMounted(() => {
  if (!process.client) return;
  handleAuth();
});
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  background-color: var(--v-background-base);
}
</style>