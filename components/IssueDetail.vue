<!-- components/IssueDetail.vue -->
<template>
  <v-card variant="flat">
    <v-card-title class="d-flex align-center pa-2" v-if="issue">
      <span class="text-h6">#{{ issue.number }} {{ issue.title }}</span>
      <v-chip
        v-for="label in (issue.labels || [])"
        :key="label"
        :color="getLabelColor(label)"
        size="small"
        class="ml-2"
      >
        {{ label }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pt-2">
      <div v-if="issue" class="d-flex align-center mb-2">
        <v-avatar size="24">
          <v-img :src="getAvatarUrl(issue.author)" :alt="issue.author"></v-img>
        </v-avatar>
        <span class="text-body-2 ml-2">{{ issue.author }}</span>
        <v-chip size="x-small" :color="issue.state === 'open' ? 'success' : 'error'" class="ml-auto">
          {{ issue.state }}
        </v-chip>
      </div>

      <v-expansion-panels v-if="issue?.body">
        <v-expansion-panel>
          <v-expansion-panel-title>Description</v-expansion-panel-title>
          <v-expansion-panel-text>
            {{ issue.body || 'No description provided.' }}
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <template v-if="isAutomationIssue">
        <v-divider class="my-4"></v-divider>
        <div class="d-flex flex-column gap-2">
          <div class="d-flex align-center">
            <v-icon color="purple">mdi-robot</v-icon>
            <span class="text-subtitle-2 ml-2">Automation Status</span>
            <v-chip
              :color="getStatusColor"
              size="x-small"
              class="ml-auto"
            >
              {{ automationStatus }}
            </v-chip>
          </div>
          <v-progress-linear
            v-if="automationStatus !== 'pending'"
            :model-value="automationProgress"
            :color="getStatusColor"
            height="8"
          ></v-progress-linear>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEventBus, EVENTS } from '../composables/useEventBus';

// Define props
const props = defineProps<{
  issue: Issue
}>();

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
  automationProgress?: number;
  children?: Issue[];
}

interface Comment {
  id: number;
  author: string;
  body: string;
  createdAt?: string;
  created_at?: string;
}

// Add getAvatarUrl method
const getAvatarUrl = (username?: string) => {
  if (!username) return '';
  // Using DiceBear for consistent avatar generation based on username
  return `https://avatars.dicebear.com/api/identicon/${username}.svg`;
};

// Check if issue is an automation issue
const isAutomationIssue = computed(() => {
  return props.issue?.labels?.some(label => label.toLowerCase() === 'ai-task') ?? false;
});

// Get color for label
const getLabelColor = (label: string) => {
  if (!label) return 'default';
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
const getStatusColor = computed(() => {
  if (!props.issue?.automationStatus) return 'info';
  switch (props.issue.automationStatus) {
    case 'pending': return 'info';
    case 'in-progress': return 'warning';
    case 'completed': return 'success';
    case 'failed': return 'error';
    default: return 'info';
  }
});

const automationStatus = computed(() => {
  return props.issue?.automationStatus || 'pending';
});

const automationProgress = computed(() => {
  return props.issue?.automationProgress || 0;
});
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