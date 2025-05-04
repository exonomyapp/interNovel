<!-- components/IssueDetail.vue -->
<template>
  <div class="issue-detail">
    <div v-if="!selectedIssue" class="no-selection pa-4 text-center">
      <v-icon icon="mdi-file-document-outline" size="large" color="grey-lighten-1" class="mb-2"></v-icon>
      <p class="text-body-1 text-grey">Select an issue from the tree to view details</p>
    </div>
    
    <div v-else>
      <!-- Issue header -->
      <v-card class="mb-4">
        <v-card-title class="text-h5 d-flex align-center">
          <!-- Automation indicator if applicable -->
          <v-chip 
            v-if="isAutomationIssue" 
            color="primary" 
            size="small" 
            class="mr-2"
            prepend-icon="mdi-robot"
          >
            AI
          </v-chip>
          
          #{{ selectedIssue.number }} - {{ selectedIssue.title }}
        </v-card-title>
        
        <v-card-subtitle>
          <div class="d-flex flex-wrap align-center">
            <v-chip 
              :color="selectedIssue.state === 'open' ? 'success' : 'error'" 
              size="small" 
              class="mr-2"
            >
              {{ selectedIssue.state }}
            </v-chip>
            
            <span>
              Opened by {{ selectedIssue.author || 'Unknown' }} 
              on {{ formatDate(selectedIssue.createdAt || selectedIssue.created_at) }}
            </span>
            
            <span v-if="selectedIssue.parentId" class="ml-2">
              | Parent: #{{ selectedIssue.parentId }}
            </span>
            
            <!-- Display labels if any -->
            <div v-if="selectedIssue.labels && selectedIssue.labels.length" class="ml-auto">
              <v-chip
                v-for="label in selectedIssue.labels"
                :key="label"
                size="x-small"
                class="ml-1"
                :color="getLabelColor(label)"
              >
                {{ label }}
              </v-chip>
            </div>
          </div>
        </v-card-subtitle>
        
        <!-- Issue body content -->
        <v-card-text v-if="selectedIssue.body">
          <v-divider class="mb-4"></v-divider>
          <div class="issue-body">
            <h3 class="text-subtitle-1 mb-2">Description</h3>
            <pre class="issue-body-content">{{ selectedIssue.body }}</pre>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-btn 
            :href="`https://github.com/exonomyapp/interNovel/issues/${selectedIssue.number}`" 
            target="_blank"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-github"
          >
            View on GitHub
          </v-btn>
          
          <v-btn
            to="/issue/[number]"
            :href="`/issue/${selectedIssue.number}`"
            color="primary"
            variant="text"
            prepend-icon="mdi-open-in-new"
          >
            Open Full Page
          </v-btn>
        </v-card-actions>
      </v-card>
      
      <!-- Child Issues Section (if any) -->
      <div v-if="childIssues.length > 0" class="mt-6">
        <h3 class="text-h6 mb-3">Child Issues</h3>
        <v-list>
          <v-list-item 
            v-for="child in childIssues" 
            :key="child.id"
            @click="selectIssue(child)"
            class="mb-2"
            variant="outlined"
          >
            <template v-slot:prepend>
              <v-icon 
                :icon="isChildAutomation(child) ? 'mdi-robot' : 'mdi-source-branch'" 
                size="small"
                :color="isChildAutomation(child) ? 'primary' : undefined"
              ></v-icon>
            </template>
            
            <template v-slot:title>
              #{{ child.number }} - {{ child.title }}
            </template>
            
            <template v-slot:subtitle>
              <div class="d-flex align-center">
                <v-chip 
                  :color="child.state === 'open' ? 'success' : 'error'" 
                  size="x-small" 
                  class="mr-2"
                >
                  {{ child.state }}
                </v-chip>
                
                <span>{{ formatDate(child.createdAt || child.created_at) }}</span>
                
                <v-chip
                  v-if="isChildAutomation(child)"
                  size="x-small"
                  :color="getStatusColor(getChildAutomationStatus(child))"
                  class="ml-2"
                >
                  {{ getChildAutomationStatus(child) }}
                </v-chip>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
      
      <!-- Comments Preview Section -->
      <div class="mt-6">
        <h3 class="text-h6 mb-3">Comments</h3>
        
        <v-alert v-if="commentsLoading" type="info" text="Loading comments..." variant="outlined" class="mb-4"></v-alert>
        
        <div v-else-if="comments.length > 0" class="comments-preview">
          <v-card 
            v-for="comment in comments.slice(0, 3)" 
            :key="comment.id"
            class="mb-4"
            variant="outlined"
          >
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-1">
                  <v-icon>mdi-account</v-icon>
                </v-avatar>
              </template>
              
              <v-card-title>
                <div class="d-flex justify-space-between align-center">
                  <span>{{ comment.author }}</span>
                  <span class="text-caption">{{ formatDate(comment.createdAt || comment.created_at) }}</span>
                </div>
              </v-card-title>
            </v-card-item>
            
            <v-divider></v-divider>
            
            <v-card-text>
              <div class="text-body-1" style="white-space: pre-wrap; word-wrap: break-word;">{{ comment.body }}</div>
            </v-card-text>
          </v-card>
          
          <div v-if="comments.length > 3" class="text-center mt-2">
            <v-btn 
              color="primary" 
              variant="text"
              :to="`/issue/${selectedIssue.number}`"
            >
              View all {{ comments.length }} comments
            </v-btn>
          </div>
        </div>
        
        <v-alert v-else type="info" text="No comments yet." variant="outlined"></v-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useEventBus, EVENTS } from '../composables/useEventBus';

// Define the issue type (should match your types definition)
interface Issue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  labels?: string[];
  author?: string;
  parentId?: number;
  automationStatus?: string;
  children?: Issue[];
}

interface Comment {
  id: number;
  author: string;
  body: string;
  createdAt?: string;
  created_at?: string;
}

// State
const selectedIssue = ref<Issue | null>(null);
const allIssues = ref<Issue[]>([]);
const comments = ref<Comment[]>([]);
const commentsLoading = ref(false);

// Listen for issue selection events
const { on, emit } = useEventBus();

// Subscribe to issue selection events
watch(() => selectedIssue.value?.id, async (newId) => {
  if (newId) {
    // Fetch comments for this issue
    await fetchComments(selectedIssue.value?.number);
    
    // Fetch all issues if we don't already have them
    if (allIssues.value.length === 0) {
      await fetchAllIssues();
    }
  }
}, { immediate: true });

// Child issues computed property
const childIssues = computed(() => {
  if (!selectedIssue.value || !allIssues.value?.length) return [];
  return allIssues.value.filter(issue => issue.parentId === selectedIssue.value?.id);
});

// Load all issues
const fetchAllIssues = async () => {
  try {
    const response = await fetch('/api?type=issues');
    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }
    allIssues.value = await response.json();
  } catch (error) {
    console.error('Error fetching all issues:', error);
    allIssues.value = [];
  }
};

// Load comments for the selected issue
const fetchComments = async (issueNumber?: number) => {
  if (!issueNumber) return;
  
  commentsLoading.value = true;
  try {
    const response = await fetch(`/api?type=comments&issueNumber=${issueNumber}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    comments.value = await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    comments.value = [];
  } finally {
    commentsLoading.value = false;
  }
};

// Setup event listener when the component is mounted
onMounted(() => {
  const unsubscribe = on(EVENTS.ISSUE_SELECTED, (issue: Issue) => {
    selectedIssue.value = issue;
  });
  
  // Clean up listener when component is unmounted
  onUnmounted(() => {
    unsubscribe();
  });
  
  // Fetch initial data
  fetchAllIssues();
});

// Select another issue (used for child issue navigation)
const selectIssue = (issue: Issue) => {
  selectedIssue.value = issue;
  emit(EVENTS.ISSUE_SELECTED, issue);
};

// Format date for display
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Check if issue is an automation issue
const isAutomationIssue = computed(() => {
  if (!selectedIssue.value) return false;
  
  // Check for automation in labels
  if (selectedIssue.value.labels?.some(
    label => label === 'automation' || label === 'ai-task'
  )) {
    return true;
  }
  
  // Check title for automation markers
  return selectedIssue.value.title.toLowerCase().includes('[automation]') || 
         selectedIssue.value.title.toLowerCase().includes('[ai]');
});

// Check if a child issue is an automation issue
const isChildAutomation = (child: Issue) => {
  if (!child) return false;
  
  // Check for automation in labels
  if (child.labels?.some(
    label => label === 'automation' || label === 'ai-task'
  )) {
    return true;
  }
  
  // Check title for automation markers
  return child.title.toLowerCase().includes('[automation]') || 
         child.title.toLowerCase().includes('[ai]');
};

// Get child automation status
const getChildAutomationStatus = (child: Issue) => {
  if (!child) return 'pending';
  
  if (child.automationStatus) {
    return child.automationStatus;
  }
  
  // Extract from body if available
  if (child.body) {
    if (child.body.toLowerCase().includes('status: completed')) return 'completed';
    if (child.body.toLowerCase().includes('status: in-progress')) return 'in-progress';
    if (child.body.toLowerCase().includes('status: failed')) return 'failed';
  }
  
  return 'pending';
};

// Get color for label
const getLabelColor = (label: string) => {
  if (label === 'automation' || label === 'ai-task') return 'purple';
  if (label.startsWith('priority:')) {
    const priority = label.split(':')[1];
    return getPriorityColor(priority);
  }
  return undefined; // Default color
};

// Get color for priority
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'info';
  }
};

// Get color for status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'info';
    case 'in-progress': return 'warning';
    case 'completed': return 'success';
    case 'failed': return 'error';
    default: return 'info';
  }
};
</script>

<style scoped>
.issue-detail {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.no-selection {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(0, 0, 0, 0.38);
}

.issue-body-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 12px;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>