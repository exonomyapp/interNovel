<template>
  <div class="x-style-content">
    <!-- Panel 1: Issues Tree -->
    <section class="panel tree-panel">
      <!-- Issue Tree Navigation -->
      <TreeNav ref="treeNavComponent" @issue-selected="handleIssueSelected" />
      
      <!-- New Issue Button -->
      <v-btn 
        block
        color="primary" 
        class="new-issue-button mt-3"
        prepend-icon="mdi-plus" 
        @click="toggleCreateForm"
        variant="tonal"
      >
        {{ showCreateForm ? 'Hide Form' : 'New Issue' }}
      </v-btn>
      
      <!-- Create Issue Form (collapsible) -->
      <v-expand-transition>
        <div v-if="showCreateForm" class="create-issue-form mt-3">
          <v-card>
            <v-card-title class="d-flex align-center">
              <span>Create New Issue</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="showCreateForm = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <CreateIssueForm @issue-created="onIssueCreated" />
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>
    </section>
    
    <!-- Panel 2: Issue Details -->
    <section class="panel details-panel">
      <div class="section-header">
        <h2>Issue Details</h2>
        <v-btn 
          v-if="selectedIssue"
          icon
          variant="text"
          color="primary"
          size="small"
          :href="`https://github.com/owner/repo/issues/${selectedIssue.number}`"
          target="_blank"
          title="View on GitHub"
        >
          <v-icon>mdi-github</v-icon>
        </v-btn>
      </div>
      
      <div v-if="selectedIssue" class="selected-issue-details">
        <IssueDetail :issue="selectedIssue" />
      </div>
      
      <div v-else class="no-issue-selected">
        <v-alert type="info" density="compact">
          Select an issue from the tree to view details
        </v-alert>
      </div>
    </section>
    
    <!-- Panel 3: Comments -->
    <section class="panel comments-panel">
      <div class="section-header">
        <h2>Comments</h2>
        <v-btn
          v-if="selectedIssue && comments.length > 0"
          size="small"
          variant="text"
          color="primary"
          @click="fetchComments(selectedIssue.number)"
          title="Refresh comments"
        >
          <v-icon size="small">mdi-refresh</v-icon>
        </v-btn>
      </div>
      
      <div v-if="!selectedIssue" class="no-issue-selected">
        <v-alert type="info" density="compact">
          Select an issue to view comments
        </v-alert>
      </div>
      
      <div v-else-if="isLoadingComments" class="loading-comments">
        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
        <span class="ml-2 text-caption">Loading comments...</span>
      </div>
      
      <div v-else-if="comments.length > 0" class="comments-list">
        <v-card
          v-for="comment in comments"
          :key="comment.id"
          class="mb-2"
          variant="outlined"
          density="compact"
        >
          <v-card-item class="pa-2">
            <template v-slot:prepend>
              <v-avatar size="24">
                <v-img :src="getAvatarUrl(comment.author)" alt="Comment author"></v-img>
              </v-avatar>
            </template>
            
            <v-card-title class="text-body-2 d-flex justify-space-between align-center pa-0">
              <span>{{ comment.author }}</span>
              <span class="text-caption">{{ formatDate(comment.createdAt) }}</span>
            </v-card-title>
          </v-card-item>
          
          <v-divider></v-divider>
          
          <v-card-text class="py-2 px-3 text-body-2">
            <div class="comment-body">{{ comment.body }}</div>
          </v-card-text>
          
          <v-card-actions v-if="comment.author === currentUser" class="py-1 px-2">
            <v-spacer></v-spacer>
            <v-btn size="x-small" variant="text" color="error" density="compact">
              Delete
            </v-btn>
            <v-btn size="x-small" variant="text" color="primary" density="compact">
              Edit
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
      
      <div v-else class="no-comments">
        <v-alert type="info" class="text-caption" density="compact">
          No comments on this issue yet
        </v-alert>
      </div>
      
      <!-- Add comment form -->
      <div v-if="selectedIssue" class="add-comment-section mt-2">
        <v-textarea
          v-model="newComment"
          label="Add a comment"
          rows="2"
          variant="outlined"
          hide-details
          density="compact"
          class="text-caption"
        ></v-textarea>
        
        <div class="d-flex justify-end mt-2">
          <v-btn
            color="primary"
            size="small"
            density="compact"
            :disabled="!newComment.trim() || isSubmittingComment"
            @click="submitComment"
          >
            <v-icon v-if="isSubmittingComment" icon="mdi-loading" class="loading-icon mr-1" size="small"></v-icon>
            <span>{{ isSubmittingComment ? 'Submitting...' : 'Submit' }}</span>
          </v-btn>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEventBus, EVENTS } from '../composables/useEventBus';
import TreeNav from '../components/TreeNav.vue';
import { useTheme } from 'vuetify';

// Types
interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  author: string;
  created_at: string;
  updated_at: string;
  labels: string[];
}

interface Comment {
  id: number;
  issueNumber: number;
  author: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// Component refs
const treeNavComponent = ref<any>(null);
const theme = useTheme();

// UI state
const showCreateForm = ref(false);
const showComments = ref(false);

// Data state
const selectedIssue = ref<Issue | null>(null);
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
const handleIssueSelected = async (issue: Issue) => {
  selectedIssue.value = issue;
  newComment.value = '';
  
  if (issue) {
    await fetchComments(issue.number);
    // Auto-show comments when issue is selected
    showComments.value = true;
  }
};

const onIssueCreated = (issue: Issue) => {
  showCreateForm.value = false;
  emit(EVENTS.RELOAD_DATA);
  // Optionally select the newly created issue
  handleIssueSelected(issue);
};

// API calls
const fetchComments = async (issueNumber: number) => {
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
  // Listen for issue selection events from other components
  unsubscribes.push(on(EVENTS.ISSUE_SELECTED, handleIssueSelected));
  
  // Listen for create form trigger
  unsubscribes.push(on(EVENTS.SHOW_CREATE_FORM, () => {
    showCreateForm.value = true;
  }));
  
  // Listen for refresh events
  unsubscribes.push(on(EVENTS.RELOAD_DATA, () => {
    if (treeNavComponent.value) {
      // Refresh the tree nav component
      treeNavComponent.value.reload();

      // Clear the form
    }
    
    if (selectedIssue.value) {
      fetchComments(selectedIssue.value.number);
    }
  }));
});

// Clean up event listeners
onUnmounted(() => {
  unsubscribes.forEach(unsubscribe => unsubscribe());
});

// Page meta
useHead({
  title: 'Issue Manager - interNovel',
});
</script>

<style scoped>
/* X.com-inspired styling */
.x-style-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 64px); /* Adjust for header */
  padding: 16px;
  max-width: 1500px;
  margin: 0 auto;
}

/* Panel styling */
.panel {
  padding: 12px;
  border-radius: 16px;
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-opacity), 0.12);
  overflow-y: auto;
}

/* Panel sizes */
.tree-panel {
  height: 35%; /* Top panel */
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.details-panel {
  height: 35%; /* Middle panel */
  min-height: 200px;
}

.comments-panel {
  height: 30%; /* Bottom panel */
  min-height: 150px;
}

/* Section headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--v-border-opacity), 0.08);
}

/* Make cards more compact, X.com style */
.selected-issue-card {
  border-radius: 16px;
  overflow: hidden;
}

/* Issue body content */
.issue-body-content {
  max-height: none;
  overflow-y: visible;
}

.issue-body {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 14px;
}

.no-description {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: italic;
}

/* Empty states */
.no-issue-selected, .no-comments {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  padding: 24px;
}

/* Comments list */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: calc(100% - 120px); /* Leave space for the comment form */
}

.comment-body {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 14px;
}

/* Loading states */
.loading-comments {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* New issue button and comments toggle */
.new-issue-button {
  border-radius: 20px;
  margin: 8px 0;
}

/* Add comment section */
.add-comment-section {
  margin-top: 12px;
  border-top: 1px solid rgba(var(--v-border-opacity), 0.08);
  padding-top: 12px;
}

/* Responsive adjustments */
@media (min-width: 1200px) {
  .x-style-content {
    height: calc(100vh - 64px);
  }
}

@media (max-width: 960px) {
  .x-style-content {
    height: auto;
    min-height: calc(100vh - 64px);
  }
  
  .panel {
    height: auto;
  }
  
  .tree-panel {
    min-height: 300px;
  }
  
  .details-panel {
    min-height: 300px;
  }
  
  .comments-panel {
    min-height: 300px;
  }
}
</style>