import { ref, onMounted } from 'vue';

export const useAuth = () => {
  const isAuthenticated = ref(false);
  const userAvatar = ref('');
  const userName = ref('');
  const loading = ref(true);

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/auth/token');
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Failed to fetch token:', error);
      return null;
    }
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        userAvatar.value = data.avatar_url;
        userName.value = data.login;
        isAuthenticated.value = true;
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      loading.value = false;
    }
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
      isAuthenticated.value = false;
      userAvatar.value = '';
      userName.value = '';
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  onMounted(async () => {
    const token = await fetchToken();
    if (token) {
      await fetchUserInfo(token);
    } else {
      loading.value = false;
    }
  });

  return {
    isAuthenticated,
    userAvatar,
    userName,
    loading,
    login,
    logout
  };
}; 