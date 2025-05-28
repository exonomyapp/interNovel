<template>
  <div class="page-container">
    <div class="page-grid">
      <!-- Left column -->
      <div class="left-column">
        <div class="panel panel-repos">
          <v-select
            v-model="selectedRepository"
            :items="repositories"
            item-title="name"
            return-object
            label="Select Repository"
            class="gh-select"
            density="compact"
            variant="outlined"
            hide-details
          >
            <template v-slot:prepend>
              <v-icon icon="mdi-source-repository" size="small" class="mr-2" color="var(--gh-fg-muted)" />
            </template>
            <template v-slot:append>
              <v-btn
                icon="mdi-refresh"
                size="small"
                variant="text"
                @click="refreshRepositories"
                :loading="loading"
                class="gh-button"
              ></v-btn>
            </template>
          </v-select>
        </div>
        <div class="panel panel-tree">
          <tree-nav 
            ref="treeNavComponent" 
            @issue-selected="handleIssueSelected"
            :repository="selectedRepository?.full_name"
          />
        </div>
      </div>

      <!-- Right column -->
      <div class="right-column">
        <div class="panel panel-details">
          <v-card v-if="selectedIssue" class="gh-box h-100">
            <IssueDetail :issue="selectedIssue" />
          </v-card>
          <v-card v-else class="gh-box h-100 d-flex align-center justify-center">
            <span class="gh-subtitle">Select an issue to view details</span>
          </v-card>
        </div>

        <div class="panel panel-comments">
          <v-card v-if="selectedIssue" class="gh-box h-100">
            <comments-section :issue="selectedIssue" />
          </v-card>
          <v-card v-else class="gh-box h-100 d-flex align-center justify-center">
            <span class="gh-subtitle">Select an issue to view comments</span>
          </v-card>
        </div>

        <div class="panel panel-logs">
          <v-card class="gh-box h-100">
            <log-viewer />
          </v-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useEventBus, EVENTS } from '../composables/useEventBus';
import TreeNav from '../components/TreeNav.vue';
import IssueDetail from '../components/IssueDetail.vue';
import CommentsSection from '../components/CommentsSection.vue';
import LogViewer from '../components/LogViewer.vue';
import RepositoryList from '../components/RepositoryList.vue';
import type { Issue, Comment } from '../types';
import { useTheme } from 'vuetify';

// Define repository type
interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  open_issues_count: number;
}

// Refs and state
const treeNavComponent = ref<InstanceType<typeof TreeNav> | null>(null);
const theme = useTheme();
const showCreateForm = ref(false);
const selectedIssue = ref<Issue | null>(null);
const comments = ref<Comment[]>([]);
const isLoadingComments = ref(false);
const newComment = ref('');
const isSubmittingComment = ref(false);
const isFetchingComments = ref(false);
const githubAccessToken = ref<string | null>(null);
const repositories = ref<Repository[]>([]);
const selectedRepository = ref<Repository | null>(null);
const loading = ref(false);

// Computed property for authentication state
const isAuthenticated = computed(() => !!githubAccessToken.value);

// Watch for repository changes
watch(selectedRepository, () => {
  // Clear selected issue when repository changes
  selectedIssue.value = null;
  comments.value = [];
  // Reload the tree nav
  if (treeNavComponent.value?.reload) {
    treeNavComponent.value.reload();
  }
});

// Handle logout
const handleLogout = () => {
  githubAccessToken.value = null;
  localStorage.removeItem('github_access_token');
  selectedRepository.value = null;
  selectedIssue.value = null;
  comments.value = [];
};

// Handle login
const handleLogin = () => {
  // The actual login will be handled by the Users component
  console.log('Login initiated');
};

// Simulate auth token parsing after OAuth redirect
onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    githubAccessToken.value = token;
    localStorage.setItem('github_access_token', token);
  } else {
    const storedToken = localStorage.getItem('github_access_token');
    githubAccessToken.value = storedToken;
  }
  refreshRepositories();
});

// EventBus setup
const { on, emit } = useEventBus();
let unsubscribes: Function[] = [];

const handleIssueSelected = (issue: Issue | null) => {
  selectedIssue.value = issue;
  if (issue?.number && selectedRepository.value) {
    void fetchComments(issue.number);
  }
};

const fetchComments = async (issueNumber: number) => {
  if (isFetchingComments.value || !githubAccessToken.value || !selectedRepository.value) return;
  isFetchingComments.value = true;
  isLoadingComments.value = true;
  comments.value = [];

  try {
    const response = await fetch(`https://api.github.com/repos/${selectedRepository.value.full_name}/issues/${issueNumber}/comments`, {
      headers: {
        Authorization: `Bearer ${githubAccessToken.value}`,
      },
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);

    comments.value = await response.json();
  } catch (error) {
    console.error('Failed to fetch comments:', error);
  } finally {
    isLoadingComments.value = false;
    isFetchingComments.value = false;
  }
};

const submitComment = async () => {
  if (!selectedIssue.value || !newComment.value.trim() || !githubAccessToken.value || !selectedRepository.value) return;
  isSubmittingComment.value = true;

  try {
    const response = await fetch(`https://api.github.com/repos/${selectedRepository.value.full_name}/issues/${selectedIssue.value.number}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${githubAccessToken.value}`,
      },
      body: JSON.stringify({
        body: newComment.value,
      }),
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);

    const comment = await response.json();
    comments.value.push(comment);
    newComment.value = '';
    emit(EVENTS.COMMENT_ADDED, comment);
  } catch (error) {
    console.error('Failed to post comment:', error);
  } finally {
    isSubmittingComment.value = false;
  }
};

// Dark mode toggle
const toggleDarkMode = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
};

// Event lifecycle
onMounted(() => {
  unsubscribes = [
    on(EVENTS.SHOW_CREATE_FORM, () => {
      showCreateForm.value = true;
    }),
    on(EVENTS.RELOAD_DATA, () => {
      if (treeNavComponent.value?.reload) treeNavComponent.value.reload();
    }),
  ];
});

onUnmounted(() => {
  unsubscribes.forEach(unsub => unsub());
});

useHead({
  title: 'Issue Manager - interNovel',
});

// Add refreshRepositories function
const refreshRepositories = async () => {
  loading.value = true;
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

    const data = await response.json();
    repositories.value = data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      open_issues_count: repo.open_issues_count
    }));
  } catch (err) {
    console.error('Error fetching repositories:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-container {
  background-color: var(--gh-bg-canvas);
  min-height: 100vh;
}

.page-grid {
  display: grid;
  grid-template-columns: minmax(300px, 25%) 1fr;
  gap: 16px;
  padding: 16px;
  height: calc(100vh - 64px);
  overflow: hidden;
  max-width: 1600px;
  margin: 0 auto;
}

.left-column {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.right-column {
  display: grid;
  grid-template-rows: minmax(200px, 35%) minmax(200px, 35%) minmax(150px, 30%);
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-repos {
  min-height: 0;
  padding: 8px;
}

.panel-tree {
  min-height: 0;
  height: 100%;
}

.panel-details,
.panel-comments,
.panel-logs {
  min-height: 0;
  height: 100%;
}

:deep(.v-card) {
  background-color: var(--gh-bg-default) !important;
  border: 1px solid var(--gh-border-default) !important;
  box-shadow: var(--gh-shadow-small) !important;
}

:deep(.gh-select) {
  background-color: var(--gh-bg-default) !important;
}

:deep(.v-field) {
  background-color: var(--gh-bg-default) !important;
  border-color: var(--gh-border-default) !important;
}

:deep(.v-field:hover) {
  border-color: var(--gh-border-muted) !important;
}

:deep(.v-field--focused) {
  border-color: var(--gh-accent-emphasis) !important;
}
</style>
