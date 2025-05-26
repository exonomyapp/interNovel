import { Octokit } from '@octokit/rest';
import { ref, computed } from 'vue';

export const useGithub = () => {
  const accessToken = ref<string | null>(null);
  const octokit = ref<Octokit | null>(null);
  const repositories = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const userAvatar = ref<string>('');
  const userName = ref<string>('');

  const isAuthenticated = computed(() => !!accessToken.value);

  const initialize = () => {
    if (process.client) {
      const token = localStorage.getItem('github_access_token');
      if (token) {
        accessToken.value = token;
        octokit.value = new Octokit({
          auth: token
        });
        // Fetch user data when initializing
        fetchUserData();
      }
    }
  };

  const fetchUserData = async () => {
    if (!octokit.value) return;

    try {
      const { data } = await octokit.value.users.getAuthenticated();
      userAvatar.value = data.avatar_url;
      userName.value = data.login;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchRepositories = async () => {
    if (!octokit.value) {
      error.value = 'Not authenticated';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data } = await octokit.value.repos.listForAuthenticatedUser({
        visibility: 'all',
        sort: 'updated',
        per_page: 100
      });
      repositories.value = data;
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch repositories';
      console.error('Error fetching repositories:', e);
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    if (process.client) {
      localStorage.removeItem('github_access_token');
    }
    accessToken.value = null;
    octokit.value = null;
    repositories.value = [];
    userAvatar.value = '';
    userName.value = '';
    error.value = null;
  };

  // Initialize on composable creation
  initialize();

  return {
    isAuthenticated,
    repositories,
    loading,
    error,
    userAvatar,
    userName,
    fetchRepositories,
    fetchUserData,
    initialize,
    logout
  };
}; 