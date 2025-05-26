<template>
  <div class="repository-list gh-box">
    <div class="gh-header">
      <div class="d-flex align-center justify-space-between">
        <div class="gh-title">Repositories</div>
        <v-btn
          size="small"
          variant="text"
          icon="mdi-refresh"
          @click="fetchRepositories"
          :loading="loading"
          class="gh-button"
        ></v-btn>
      </div>
    </div>

    <div v-if="error" class="text-error text-caption pa-4">
      {{ error }}
    </div>

    <v-list
      density="compact"
      class="repository-items"
      :selected="[selectedRepo]"
      select-strategy="single-independent"
      bg-color="transparent"
    >
      <v-list-item
        v-for="repo in repositories"
        :key="repo.id"
        :value="repo"
        :active="selectedRepo?.id === repo.id"
        @click="selectRepository(repo)"
        class="gh-list-item"
        :class="{ 'selected': selectedRepo?.id === repo.id }"
      >
        <template v-slot:prepend>
          <v-icon 
            size="small" 
            :color="repo.private ? 'error' : 'success'"
            :icon="repo.private ? 'mdi-lock' : 'mdi-source-repository'"
            class="mr-2"
          ></v-icon>
        </template>

        <v-list-item-title class="gh-subtitle">
          {{ repo.name }}
        </v-list-item-title>

        <template v-slot:append>
          <div 
            v-if="repo.open_issues_count > 0"
            class="gh-tag"
          >
            {{ repo.open_issues_count }}
          </div>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="!loading && repositories.length === 0" class="text-center py-4">
      <span class="gh-subtitle">No repositories found</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  open_issues_count: number;
  html_url: string;
}

const repositories = ref<Repository[]>([]);
const selectedRepo = ref<Repository | null>(null);
const loading = ref(false);
const error = ref('');

const emit = defineEmits<{
  'update:selected': [Repository | null];
}>();

const fetchRepositories = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = localStorage.getItem('github_access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    repositories.value = await response.json();
  } catch (err) {
    console.error('Error fetching repositories:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch repositories';
  } finally {
    loading.value = false;
  }
};

const selectRepository = (repo: Repository) => {
  selectedRepo.value = repo;
  emit('update:selected', repo);
};

onMounted(() => {
  fetchRepositories();
});

// Expose refresh method
defineExpose({
  refresh: fetchRepositories,
});
</script>

<style scoped>
.repository-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.repository-items {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.gh-list-item {
  min-height: 40px !important;
}

.gh-list-item:hover {
  background-color: var(--gh-bg-subtle) !important;
}

.gh-list-item.selected {
  background-color: var(--gh-accent-muted) !important;
}

.gh-list-item.selected .gh-subtitle {
  color: var(--gh-accent-fg) !important;
  font-weight: 500;
}

.gh-tag {
  min-width: 20px;
  justify-content: center;
}
</style> 