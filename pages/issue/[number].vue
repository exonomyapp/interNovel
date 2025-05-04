<!-- pages/issue/[number].vue -->
<template>
  <div>
    <v-container>
      <div v-if="pending">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p>Loading issue...</p>
      </div>
      
      <div v-else-if="error">
        <v-alert type="error" title="Error Loading Issue">
          {{ error.message }}
        </v-alert>
        <v-btn to="/" color="primary" class="mt-4">Back to Issues</v-btn>
      </div>
      
      <div v-else-if="issue">
        <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
        
        <!-- Main issue card -->
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
            
            #{{ issue.number }} - {{ issue.title }}
          </v-card-title>
          
          <v-card-subtitle>
            <div class="d-flex flex-wrap align-center">
              <v-chip 
                :color="issue.state === 'open' ? 'success' : 'error'" 
                size="small" 
                class="mr-2"
              >
                {{ issue.state }}
              </v-chip>
              
              <span>Opened by {{ issue.author }} on {{ formatDate(issue.createdAt) }}</span>
              
              <span v-if="issue.parentId" class="ml-2">
                | Parent: 
                <nuxt-link :to="`/issue/${issue.parentId}`">#{{ issue.parentId }}</nuxt-link>
              </span>
              
              <!-- Display labels if any -->
              <div v-if="issue.labels && issue.labels.length" class="ml-auto">
                <v-chip
                  v-for="label in issue.labels"
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
          
          <!-- Automation Status Dashboard (if this is an automation issue) -->
          <v-card-text v-if="isAutomationIssue" class="automation-dashboard">
            <v-card color="primary" variant="outlined" class="mb-2">
              <v-card-title class="text-subtitle-1">
                <v-icon start>mdi-robot</v-icon>
                AI Automation Status
              </v-card-title>
              
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <span class="text-body-2 mr-2">Status:</span>
                  <v-chip
                    :color="getStatusColor(automationStatus)"
                    size="small"
                  >
                    {{ automationStatus }}
                  </v-chip>
                  
                  <v-spacer></v-spacer>
                  
                  <span class="text-body-2 mr-2">Priority:</span>
                  <v-chip
                    :color="getPriorityColor(automationPriority)"
                    size="small"
                  >
                    {{ automationPriority }}
                  </v-chip>
                </div>
                
                <div class="mb-2">
                  <div class="d-flex justify-space-between">
                    <span class="text-caption">Progress</span>
                    <span class="text-caption">{{ automationProgress || 0 }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="automationProgress || 0"
                    :color="getStatusColor(automationStatus)"
                    height="10"
                    rounded
                  ></v-progress-linear>
                </div>
                
                <div v-if="automationLogs && automationLogs.length" class="mt-4">
                  <p class="text-body-2 font-weight-medium mb-2">Execution Log:</p>
                  <v-timeline density="compact" align="start">
                    <v-timeline-item
                      v-for="(log, index) in automationLogs"
                      :key="index"
                      :dot-color="log.type === 'error' ? 'error' : 'primary'"
                      size="small"
                    >
                      <div class="text-caption font-weight-medium">
                        {{ formatLogTime(log.timestamp) }}
                      </div>
                      <p class="text-body-2 mb-0">{{ log.message }}</p>
                    </v-timeline-item>
                  </v-timeline>
                </div>
                
                <v-alert v-else type="info" density="compact" class="mt-4">
                  No execution logs available yet. The AI will begin processing this task soon.
                </v-alert>
              </v-card-text>
              
              <v-card-actions>
                <v-btn variant="text" prepend-icon="mdi-refresh" @click="refreshIssue">
                  Refresh Status
                </v-btn>
                <v-btn 
                  variant="text" 
                  prepend-icon="mdi-play" 
                  color="success"
                  @click="triggerExecution"
                  :loading="isTriggering"
                  :disabled="automationStatus === 'in-progress' || automationStatus === 'completed'"
                >
                  Trigger Execution
                </v-btn>
                <v-btn 
                  variant="text" 
                  prepend-icon="mdi-stop" 
                  color="error"
                  @click="stopExecution"
                  :loading="isStopping"
                  :disabled="automationStatus !== 'in-progress'"
                >
                  Stop Execution
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-card-text>
          
          <!-- Issue body content -->
          <v-card-text v-if="issue.body || isEditingDescription">
            <v-divider class="mb-4"></v-divider>
            
            <!-- Edit mode error alert -->
            <v-alert
              v-if="saveError"
              type="error"
              :title="'Failed to save description'"
              :text="saveError.message"
              class="mb-4"
              closable
            ></v-alert>
            
            <!-- Regular view mode -->
            <div v-if="!isEditingDescription" class="issue-body">
              <div class="d-flex justify-space-between align-center mb-2">
                <h3 class="text-subtitle-1">Description</h3>
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-pencil"
                  @click="startEditing"
                >
                  Edit
                </v-btn>
              </div>
              <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ issue.body }}</pre>
            </div>
            
            <!-- Edit mode -->
            <div v-else class="issue-body-edit">
              <div class="d-flex justify-space-between align-center mb-2">
                <h3 class="text-subtitle-1">Edit Description</h3>
                <div>
                  <v-btn
                    variant="text"
                    color="error"
                    size="small"
                    class="mr-2"
                    prepend-icon="mdi-close"
                    @click="cancelEditing"
                    :disabled="isSaving"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="success"
                    size="small"
                    prepend-icon="mdi-content-save"
                    @click="saveDescription"
                    :loading="isSaving"
                    :disabled="isSaving"
                  >
                    Save
                  </v-btn>
                </div>
              </div>
              
              <v-tabs v-model="activeTab">
                <v-tab value="0">
                  <v-icon start>mdi-code-braces</v-icon>
                  Edit
                </v-tab>
                <v-tab value="1">
                  <v-icon start>mdi-eye</v-icon>
                  Preview
                </v-tab>
              </v-tabs>
              
              <v-window v-model="activeTab" class="mt-2">
                <!-- Edit Tab -->
                <v-window-item value="0">
                  <v-textarea
                    v-model="editedDescription"
                    variant="outlined"
                    :disabled="isSaving"
                    auto-grow
                    rows="10"
                    hide-details
                    class="issue-edit-textarea"
                    placeholder="Enter issue description..."
                  ></v-textarea>
                </v-window-item>
                
                <!-- Preview Tab -->
                <v-window-item value="1">
                  <div class="markdown-preview">
                    <div v-if="!editedDescription" class="text-center text-grey py-4">
                      Nothing to preview yet. Start typing in the Edit tab to see a preview.
                    </div>
                    <div v-else v-html="renderedMarkdown" class="issue-preview-content"></div>
                  </div>
                </v-window-item>
              </v-window>
            </div>
          </v-card-text>
          
          <v-card-actions>
            <v-btn 
              :href="`https://github.com/exonomyapp/interNovel/issues/${issue.number}`" 
              target="_blank"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-github"
            >
              View on GitHub
            </v-btn>
            
            <v-btn
              variant="text"
              color="primary"
              prepend-icon="mdi-refresh"
              @click="refreshIssue"
            >
              Refresh Issue
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              prepend-icon="mdi-delete"
              @click="deleteIssue"
              :loading="isSaving"
              :disabled="isSaving"
            >
              Delete Issue
            </v-btn>
          </v-card-actions>
        </v-card>
        
        <!-- Child Issues Section (if any) -->
        <div v-if="childIssues && childIssues.length > 0" class="mt-6">
          <h3 class="text-h6 mb-3">Child Issues</h3>
          <v-list>
            <v-list-item 
              v-for="child in childIssues" 
              :key="child.id"
              :to="`/issue/${child.number}`"
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
                  
                  <span>{{ formatDate(child.createdAt) }}</span>
                  
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
        
        <!-- Comments Section -->
        <div class="mt-6">
          <h3 class="text-h6 mb-3">Comments</h3>
          
          <!-- Error alert for comments -->
          <v-alert v-if="commentError" type="error" title="Comment Error" :text="commentError.message" class="mb-4" closable></v-alert>
          
          <!-- Form to add a new comment -->
          <v-textarea
            v-model="newCommentContent"
            label="Add a comment"
            variant="outlined"
            rows="3"
            class="mb-2"
            hide-details
            :disabled="isSavingComment"
          ></v-textarea>
          
          <div class="d-flex">
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" 
              class="mt-2" 
              @click="addComment" 
              :loading="isSavingComment" 
              :disabled="isSavingComment || !newCommentContent.trim()"
            >
              Add Comment
            </v-btn>
          </div>
          
          <!-- Comments List -->
          <div v-if="comments && comments.length > 0" class="mt-4">
            <v-card 
              v-for="comment in comments" 
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
                    <span class="text-caption">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                </v-card-title>
              </v-card-item>
              
              <v-divider></v-divider>
              
              <v-card-text>
                <!-- Edit mode -->
                <div v-if="editingCommentId === comment.id" class="comment-edit-form">
                  <v-textarea
                    v-model="editedCommentContent"
                    variant="outlined"
                    rows="3"
                    auto-grow
                    hide-details
                    :disabled="isSavingComment"
                    class="mb-2"
                  ></v-textarea>
                  
                  <div class="d-flex">
                    <v-spacer></v-spacer>
                    <v-btn
                      variant="text"
                      color="error"
                      size="small"
                      class="mr-2"
                      @click="cancelEditingComment"
                      :disabled="isSavingComment"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      variant="text"
                      color="success"
                      size="small"
                      @click="updateComment(comment.id)"
                      :loading="isSavingComment"
                      :disabled="isSavingComment || !editedCommentContent.trim()"
                    >
                      Save
                    </v-btn>
                  </div>
                </div>
                
                <!-- View mode -->
                <div v-else class="comment-body">
                  <div class="text-body-1 mb-4" style="white-space: pre-wrap; word-wrap: break-word;">{{ comment.body }}</div>
                  
                  <div class="d-flex">
                    <v-spacer></v-spacer>
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      class="mr-2"
                      prepend-icon="mdi-pencil"
                      @click="startEditingComment(comment)"
                    >
                      Edit
                    </v-btn>
                    <v-btn
                      variant="text"
                      color="error"
                      size="small"
                      prepend-icon="mdi-delete"
                      @click="deleteComment(comment.id)"
                    >
                      Delete
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
          
          <!-- No comments message -->
          <v-alert v-else-if="!pending" type="info" class="mt-4">
            No comments yet. Be the first to comment on this issue.
          </v-alert>
        </div>
      </div>
      
      <div v-else>
        <v-alert type="warning" title="No Issue Found">
          No issue with number {{ $route.params.number }} was found.
        </v-alert>
        <v-btn to="/" color="primary" class="mt-4">Back to Issues</v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Issue, Comment } from '../../types/index';
import { useEventBus, EVENTS } from '../../composables/useEventBus';
import { marked } from 'marked';

// Get route and issue number
const route = useRoute();
const issueNumber = computed(() => Number(route.params.number));

// Fetch the issue data
const { data: issue, pending, error, refresh: refreshIssueData } = await useFetch<Issue>(`/api?type=issues&issueNumber=${issueNumber.value}`, {
  key: `issue-${issueNumber.value}`,
  default: () => null
});

// Fetch comments for this issue
const { data: comments, refresh: refreshComments } = await useFetch<Comment[]>(`/api?type=comments&issueNumber=${issueNumber.value}`, {
  key: `comments-${issueNumber.value}`,
  default: () => []
});

// Find child issues
const { data: allIssues } = await useFetch<Issue[]>('/api?type=issues', {
  default: () => []
});

// Edit mode state
const isEditingDescription = ref(false);
const editedDescription = ref('');
const isSaving = ref(false);
const saveError = ref<Error | null>(null);
const activeTab = ref(0); // 0 = Edit, 1 = Preview

// Computed property to render markdown
const renderedMarkdown = computed(() => {
  if (!editedDescription.value) return '';
  return marked(editedDescription.value);
});

// Start editing the description
const startEditing = () => {
  editedDescription.value = issue.value?.body || '';
  isEditingDescription.value = true;
  saveError.value = null;
};

// Cancel editing and reset
const cancelEditing = () => {
  isEditingDescription.value = false;
  editedDescription.value = '';
  saveError.value = null;
};

// Save the edited description
const saveDescription = async () => {
  if (!issue.value) return;
  
  isSaving.value = true;
  saveError.value = null;
  
  try {
    // Call the API to update the issue
    const response = await fetch('/api', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: issue.value.number,
        body: editedDescription.value,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update issue description');
    }
    
    // Update the local issue data with the response
    const updatedIssue = await response.json();
    issue.value = updatedIssue;
    
    // Exit edit mode
    isEditingDescription.value = false;
    
    // Emit event to refresh the tree view
    const { emit } = useEventBus();
    emit(EVENTS.REFRESH_TREE);
    console.log('Emitted tree refresh event after saving issue description');
    
  } catch (err) {
    console.error('Error saving description:', err);
    saveError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSaving.value = false;
  }
};

// Refresh issue data
const refreshIssue = () => {
  refreshIssueData();
};

// Calculate child issues
const childIssues = computed(() => {
  if (!issue.value || !allIssues.value) return [];
  return allIssues.value.filter(i => i.parentId === issue.value?.id);
});

// For breadcrumb navigation
const breadcrumbs = computed(() => [
  {
    title: 'Home',
    disabled: false,
    to: '/',
  },
  {
    title: `Issue #${issueNumber.value}`,
    disabled: true,
  },
]);

// Format date consistently for both client and server
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // Use a fixed format that doesn't depend on locale or timezone
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  
  return `${month}/${day}/${year}`;
};

// Format timestamp for logs
const formatLogTime = (timestamp: string | number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// Check if issue is an automation issue
const isAutomationIssue = computed(() => {
  if (!issue.value) return false;
  
  // Check for automation in labels
  if (issue.value.labels && issue.value.labels.some(
    label => label === 'automation' || label === 'ai-task'
  )) {
    return true;
  }
  
  // Check title for automation markers
  return issue.value.title.toLowerCase().includes('[automation]') || 
         issue.value.title.toLowerCase().includes('[ai]');
});

// Check if a child issue is an automation issue
const isChildAutomation = (child: Issue) => {
  if (!child) return false;
  
  // Check for automation in labels
  if (child.labels && child.labels.some(
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

// Extract automation status from issue
const automationStatus = computed(() => {
  if (!issue.value || !isAutomationIssue.value) return 'pending';
  
  if (issue.value.automationStatus) {
    return issue.value.automationStatus;
  }
  
  // Extract from body if available
  if (issue.value.body) {
    if (issue.value.body.toLowerCase().includes('status: completed')) return 'completed';
    if (issue.value.body.toLowerCase().includes('status: in-progress')) return 'in-progress';
    if (issue.value.body.toLowerCase().includes('status: failed')) return 'failed';
  }
  
  return 'pending';
});

// Extract automation priority from issue
const automationPriority = computed(() => {
  if (!issue.value || !isAutomationIssue.value) return 'medium';
  
  if (issue.value.automationPriority) {
    return issue.value.automationPriority;
  }
  
  // Check for priority labels
  if (issue.value.labels) {
    const priorityLabel = issue.value.labels.find(label => 
      label.startsWith('priority:')
    );
    
    if (priorityLabel) {
      const priority = priorityLabel.split(':')[1];
      if (['low', 'medium', 'high'].includes(priority)) {
        return priority;
      }
    }
  }
  
  // Extract from body if available
  if (issue.value.body) {
    if (issue.value.body.toLowerCase().includes('priority\nhigh')) return 'high';
    if (issue.value.body.toLowerCase().includes('priority\nlow')) return 'low';
    if (issue.value.body.toLowerCase().includes('priority\nmedium')) return 'medium';
  }
  
  return 'medium';
});

// Mock progress value for demo (would come from backend in real implementation)
const automationProgress = computed(() => {
  if (!isAutomationIssue.value) return 0;
  
  switch (automationStatus.value) {
    case 'pending': return 0;
    case 'in-progress': return 45; // Mock progress
    case 'completed': return 100;
    case 'failed': return 30; // Partial progress before failure
    default: return 0;
  }
});

// Mock logs for demo (would come from backend in real implementation)
const automationLogs = computed(() => {
  if (!isAutomationIssue.value) return [];
  
  if (automationStatus.value === 'pending') {
    return [];
  }
  
  const now = new Date();
  
  // Some mock logs based on status
  if (automationStatus.value === 'in-progress') {
    return [
      { 
        timestamp: new Date(now.getTime() - 120000).toISOString(), 
        message: 'Task received by AI agent', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 90000).toISOString(), 
        message: 'Analyzing issue requirements', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 60000).toISOString(), 
        message: 'Located relevant files in codebase', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 30000).toISOString(), 
        message: 'Working on implementation', 
        type: 'info' 
      }
    ];
  } else if (automationStatus.value === 'completed') {
    return [
      { 
        timestamp: new Date(now.getTime() - 300000).toISOString(), 
        message: 'Task received by AI agent', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 240000).toISOString(), 
        message: 'Analyzing issue requirements', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 180000).toISOString(), 
        message: 'Located relevant files in codebase', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 120000).toISOString(), 
        message: 'Implementation completed', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 60000).toISOString(), 
        message: 'Tests passing', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 30000).toISOString(), 
        message: 'Changes committed and PR created', 
        type: 'info' 
      }
    ];
  } else if (automationStatus.value === 'failed') {
    return [
      { 
        timestamp: new Date(now.getTime() - 240000).toISOString(), 
        message: 'Task received by AI agent', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 180000).toISOString(), 
        message: 'Analyzing issue requirements', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 120000).toISOString(), 
        message: 'Located relevant files in codebase', 
        type: 'info' 
      },
      { 
        timestamp: new Date(now.getTime() - 60000).toISOString(), 
        message: 'Implementation attempt failed: missing dependencies', 
        type: 'error' 
      },
      { 
        timestamp: new Date(now.getTime() - 30000).toISOString(), 
        message: 'Task execution aborted', 
        type: 'error' 
      }
    ];
  }
  
  return [];
});

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

// Set page title
useHead({
  title: computed(() => issue.value 
    ? `Issue #${issue.value.number} - ${issue.value.title}` 
    : 'Issue Details')
});

// Comment state
const newCommentContent = ref('');
const isAddingComment = ref(false);
const editingCommentId = ref<number | null>(null);
const editedCommentContent = ref('');
const commentError = ref<Error | null>(null);
const isSavingComment = ref(false);

// Comment functions
const addComment = async () => {
  if (!newCommentContent.value.trim()) return;
  
  isSavingComment.value = true;
  commentError.value = null;
  
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'comment',
        issueNumber: issueNumber.value,
        content: newCommentContent.value,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add comment');
    }
    
    // Clear the form and refresh comments
    newCommentContent.value = '';
    await refreshComments();
    
  } catch (err) {
    console.error('Error adding comment:', err);
    commentError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSavingComment.value = false;
  }
};

const startEditingComment = (comment: Comment) => {
  editingCommentId.value = comment.id;
  editedCommentContent.value = comment.body;
  commentError.value = null;
};

const cancelEditingComment = () => {
  editingCommentId.value = null;
  editedCommentContent.value = '';
  commentError.value = null;
};

const updateComment = async (commentId: number) => {
  if (!editedCommentContent.value.trim()) return;
  
  isSavingComment.value = true;
  commentError.value = null;
  
  try {
    const response = await fetch('/api', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'comment',
        commentId: commentId,
        content: editedCommentContent.value,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update comment');
    }
    
    // Reset editing state and refresh comments
    editingCommentId.value = null;
    editedCommentContent.value = '';
    await refreshComments();
    
  } catch (err) {
    console.error('Error updating comment:', err);
    commentError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSavingComment.value = false;
  }
};

const deleteComment = async (commentId: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) return;
  
  isSavingComment.value = true;
  commentError.value = null;
  
  try {
    const response = await fetch('/api', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'comment',
        commentId: commentId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete comment');
    }
    
    // Refresh comments
    await refreshComments();
    
  } catch (err) {
    console.error('Error deleting comment:', err);
    commentError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSavingComment.value = false;
  }
};

// Issue CRUD operations
const deleteIssue = async () => {
  if (!issue.value) return;
  
  if (!confirm(`Are you sure you want to delete issue #${issue.value.number}?`)) return;
  
  isSaving.value = true;
  saveError.value = null;
  
  try {
    const response = await fetch('/api', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: issue.value.number,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete issue');
    }
    
    // Navigate back to issues list after successful deletion
    await navigateTo('/');
    
    // Emit event to refresh the tree view
    const { emit } = useEventBus();
    emit(EVENTS.REFRESH_TREE);
    
  } catch (err) {
    console.error('Error deleting issue:', err);
    saveError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSaving.value = false;
  }
};

// Automation execution state and methods
const isTriggering = ref(false);
const isStopping = ref(false);
const automationError = ref<Error | null>(null);

const triggerExecution = async () => {
  if (!issue.value) return;
  isTriggering.value = true;
  automationError.value = null;
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'automation',
        action: 'trigger',
        issueNumber: issue.value.number,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to trigger execution');
    }
    await refreshIssueData();
  } catch (err) {
    console.error('Trigger execution error:', err);
    automationError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isTriggering.value = false;
  }
};

const stopExecution = async () => {
  if (!issue.value) return;
  isStopping.value = true;
  automationError.value = null;
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'automation',
        action: 'stop',
        issueNumber: issue.value.number,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to stop execution');
    }
    await refreshIssueData();
  } catch (err) {
    console.error('Stop execution error:', err);
    automationError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isStopping.value = false;
  }
};
</script>

<style scoped>
.issue-body {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
}

.issue-body-edit {
  background-color: #f8f8f8;
  padding: 1rem;
  border-radius: 4px;
}

.issue-edit-textarea {
  font-family: monospace;
  background-color: white;
}

.automation-dashboard {
  background-color: rgba(25, 118, 210, 0.05);
  border-radius: 4px;
}

.markdown-preview {
  background-color: white;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  min-height: 200px;
}

.issue-preview-content {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

.issue-preview-content h1,
.issue-preview-content h2,
.issue-preview-content h3 {
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
  margin-top: 24px;
  margin-bottom: 16px;
}

.issue-preview-content code {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  padding: 0.2em 0.4em;
  font-size: 85%;
}

.issue-preview-content pre {
  background-color: #f6f8fa;
  border-radius: 3px;
  padding: 16px;
  overflow: auto;
}

.issue-preview-content blockquote {
  border-left: 0.25em solid #dfe2e5;
  color: #6a737d;
  padding: 0 1em;
  margin: 0 0 16px 0;
}

.issue-preview-content ul,
.issue-preview-content ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

.issue-preview-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.issue-preview-content table th,
.issue-preview-content table td {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.issue-preview-content table tr:nth-child(2n) {
  background-color: #f6f8fa;
}
</style>