<template>
  <div class="page-grid">
    <!-- Panel 1: Issues List (Tree) -->
    <div class="panel panel-tree">
      <tree-nav ref="treeNavComponent" @issue-selected="handleIssueSelected" />
    </div>
    
    <!-- Panel 2: Issue Details -->
    <div class="panel panel-details">
      <v-card v-if="selectedIssue" class="h-100">
        <IssueDetail :issue="selectedIssue" />
      </v-card>
      <v-card v-else class="h-100 d-flex align-center justify-center">
        <span class="text-medium-emphasis">Select an issue to view details</span>
      </v-card>
    </div>

    <!-- Panel 3: Comments Section -->
    <div class="panel panel-comments">
      <v-card v-if="selectedIssue" class="h-100">
        <comments-section :issue="selectedIssue" />
      </v-card>
      <v-card v-else class="h-100 d-flex align-center justify-center">
        <span class="text-medium-emphasis">Select an issue to view comments</span>
      </v-card>
    </div>

    <!-- Panel 4: Logs -->
    <div class="panel panel-logs">
      <log-viewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEventBus, EVENTS } from '../composables/useEventBus';
import TreeNav from '../components/TreeNav.vue';
import IssueDetail from '../components/IssueDetail.vue';
import CommentsSection from '../components/CommentsSection.vue';
import LogViewer from '../components/LogViewer.vue';
import type { Issue, Comment } from '../types';
import { useTheme } from 'vuetify';

// Fix component ref typing
const treeNavComponent = ref<InstanceType<typeof TreeNav> | null>(null);
const theme = useTheme();

// UI state
const showCreateForm = ref(false);
const showComments = ref(false);

// Data state
const selectedIssue = ref<Issue | null>(null);
const currentIssueId = ref<number | null>(null);
const comments = ref<Comment[]>([]);
const isLoadingComments = ref(false);
const newComment = ref('');
const isSubmittingComment = ref(false);

// Mock current user (would come from auth)
const currentUser = 'Demo User';

// Event bus
const { on, emit } = useEventBus();
let unsubscribes: Function[] = [];

// Toggle create form
const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value;
};

// Handlers
const handleIssueSelected = (issue: Issue | null) => {
  console.log('Index: Handling issue selection:', issue);
  if (!issue) {
    selectedIssue.value = null;
    return;
  }

  selectedIssue.value = issue;
  if (issue.number) {
    void fetchComments(issue.number);
  }
};

// Add flag to prevent duplicate fetches
const isFetchingComments = ref(false);

// API calls
const fetchComments = async (issueNumber: number) => {
  // Prevent concurrent fetches
  if (isFetchingComments.value) return;

  isFetchingComments.value = true;
  isLoadingComments.value = true;
  comments.value = [];
  
  try {
    const response = await fetch(`/api?type=comments&issueNumber=${issueNumber}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    comments.value = await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
  } finally {
    isLoadingComments.value = false;
    isFetchingComments.value = false;
  }
};

const submitComment = async () => {
  if (!selectedIssue.value || !newComment.value.trim()) return;
  
  isSubmittingComment.value = true;
  
  try {
    const response = await fetch('/api?type=comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issueNumber: selectedIssue.value.number,
        body: newComment.value,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.status}`);
    }
    
    const comment = await response.json();
    comments.value.push(comment);
    newComment.value = '';
    emit(EVENTS.COMMENT_ADDED, comment);
  } catch (error) {
    console.error('Error adding comment:', error);
  } finally {
    isSubmittingComment.value = false;
  }
};

// Toggle dark mode
const toggleDarkMode = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
};

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const getAvatarUrl = (username: string) => {
  // In a real app, you'd use the GitHub avatar or fetch it
  // This is a placeholder that generates a consistent avatar for a username
  return `https://avatars.dicebear.com/api/identicon/${username || 'unknown'}.svg`;
};

const getLabelColor = (label: string) => {
  // Assign consistent colors to common labels
  const labelColors: Record<string, string> = {
    bug: 'error',
    enhancement: 'primary',
    'good first issue': 'success',
    documentation: 'info',
    question: 'warning',
    automation: 'purple',
    'ai-task': 'purple',
  };
  
  return labelColors[label.toLowerCase()] || 'default';
};

// Event subscriptions
onMounted(() => {
  unsubscribes = [
    on(EVENTS.SHOW_CREATE_FORM, () => {
      showCreateForm.value = true;
    }),
    on(EVENTS.RELOAD_DATA, () => {
      if (treeNavComponent.value?.reload) {
        treeNavComponent.value.reload();
      }
    })
  ];
});

// Clean up event listeners
onUnmounted(() => {
  unsubscribes.forEach(unsubscribe => unsubscribe());
  unsubscribes = [];
});

// Page meta
useHead({
  title: 'Issue Manager - interNovel',
});
</script>

<style scoped>
.page-grid {
  display: grid;
  grid-template-rows: 3fr 3fr 4fr 2fr;
  gap: 16px;
  padding: 16px;
  height: calc(100vh - 64px); /* Account for header */
}

.panel {
  overflow-y: auto;
  min-height: 0; /* Important for scroll behavior */
  background: rgb(var(--v-theme-surface));
  border-radius: 4px;
}

.panel-tree {
  min-height: 200px;
}

.panel-details {
  min-height: 200px;
}

.panel-comments {
  min-height: 200px;
}

.panel-logs {
  min-height: 150px;
}
</style>