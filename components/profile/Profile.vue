<template>
  <div>
    <h1>Profile</h1>
    <div v-if="user">
      <p><strong>DID:</strong> {{ user.did }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Name:</strong> {{ user.name }}</p>
      <img :src="user.avatar_url" alt="User avatar" width="100" />
    </div>
    <form @submit.prevent="uploadAvatar">
      <input type="file" @change="onFileChange" />
      <button type="submit">Upload Avatar</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const user = ref(null);
const error = ref('');
const file = ref<File | null>(null);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    file.value = target.files[0];
  }
};

const fetchProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    user.value = await response.json();
  } catch (err) {
    error.value = 'Failed to load profile';
    console.error(err);
  }
};

const uploadAvatar = async () => {
  if (!file.value) return;

  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file.value);

    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    // Refresh profile to show new avatar
    await fetchProfile();
  } catch (err) {
    error.value = 'Failed to upload avatar';
    console.error(err);
  }
};

onMounted(() => {
  fetchProfile();
});
</script>