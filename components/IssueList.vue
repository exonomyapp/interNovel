<!-- components/IssueList.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useEventBus, EVENTS } from '../composables/useEventBus';

// Define issue type
interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  labels: string[];
  children?: Issue[];
  isAutomation?: boolean;
  automationStatus?: 'pending' | 'in-progress' | 'completed' | 'failed';
  automationPriority?: 'low' | 'medium' | 'high';
  automationProgress?: number;
}

// Define props
interface Props {
  parentId?: number; // Optional parent issue ID when showing children
  showClosed?: boolean;
  showHeader?: boolean;
  maxHeight?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  parentId: undefined,
  showClosed: false,
  showHeader: true,
  maxHeight: undefined
});

// Define emits
const emit = defineEmits(['issue-selected']);

// Component state
const issues = ref<Issue[]>([]);
const loading = ref(true);
const error = ref('');
const filterText = ref('');
const showAutomationOnly = ref(false);
const router = useRouter();
const { emit: emitEvent } = useEventBus();

// Filter issues based on search text and automation filter
const filteredIssues = computed(() => {
  let filtered = [...issues.value];
  
  // Filter by search text
  if (filterText.value) {
    const searchLower = filterText.value.toLowerCase();
    filtered = filtered.filter(issue => 
      issue.title.toLowerCase().includes(searchLower) || 
      issue.body.toLowerCase().includes(searchLower) ||
      issue.labels.some(label => label.toLowerCase().includes(searchLower))
    );
  }
  
  // Filter by automation
  if (showAutomationOnly.value) {
    filtered = filtered.filter(issue => issue.isAutomation);
  }
  
  return filtered;
});

// Get issues from the API
const fetchIssues = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Construct API URL with parent ID if applicable
    const endpoint = props.parentId 
      ? `/api?type=issues&parentId=${props.parentId}&showClosed=${props.showClosed}` 
      : `/api?type=issues&showClosed=${props.showClosed}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }
    
    const data = await response.json();
    
    // Process issues to identify automation tasks
    issues.value = data.map((issue: Issue) => {
      // Check if this is an automation issue based on labels
      const isAutomation = issue.labels.some(label => 
        label === 'automation' || label === 'ai-task'
      );
      
      // Extract automation metadata if available
      // In a real app, this would come from the server
      const automationStatus = isAutomation ? (issue.automationStatus || 'pending') : undefined;
      const automationPriority = isAutomation ? (issue.automationPriority || 'medium') : undefined;
      const automationProgress = isAutomation ? (issue.automationProgress || 0) : undefined;
      
      return {
        ...issue,
        isAutomation,
        automationStatus,
        automationPriority,
        automationProgress
      };
    });
    
  } catch (err: any) {
    console.error('Error fetching issues:', err);
    error.value = err.message || 'Failed to fetch issues';
  } finally {
    loading.value = false;
  }
};

// Expose a refresh method for parent components
defineExpose({ 
  refresh: fetchIssues 
});

// View issue details
const viewIssue = (issue: Issue) => {
  // Emit the issue selection event both as a component event and via the event bus
  emit('issue-selected', issue);
  emitEvent(EVENTS.ISSUE_SELECTED, issue);
  
  // Only navigate if we're in the child issues view
  if (props.parentId) {
    router.push(`/issue/${issue.number}`);
  }
};

// Update issue after creation
const handleIssueCreated = (newIssue: Issue) => {
  issues.value.unshift({
    ...newIssue,
    isAutomation: newIssue.labels?.some(label => 
      label === 'automation' || label === 'ai-task'
    ),
    automationStatus: newIssue.labels?.some(label => 
      label === 'automation' || label === 'ai-task'
    ) ? 'pending' : undefined
  });
};

// Format date string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Get priority color
const getPriorityColor = (priority?: string) => {
  if (!priority) return '';
  
  switch (priority) {
    case 'high': return 'red';
    case 'medium': return 'blue';
    case 'low': return 'green';
    default: return 'grey';
  }
};

// Get status color
const getStatusColor = (status?: string) => {
  if (!status) return '';
  
  switch (status) {
    case 'pending': return 'grey';
    case 'in-progress': return 'orange';
    case 'completed': return 'green';
    case 'failed': return 'red';
    default: return 'grey';
  }
};

// Get status icon
const getStatusIcon = (status?: string) => {
  if (!status) return '';
  
  switch (status) {
    case 'pending': return 'mdi-timer-sand';
    case 'in-progress': return 'mdi-robot';
    case 'completed': return 'mdi-check-circle';
    case 'failed': return 'mdi-alert-circle';
    default: return 'mdi-help-circle';
  }
};

// Fetch issues on mount
onMounted(() => {
  fetchIssues();
});
</script>

<template>
  <div class="issue-list">
    <!-- Header area with title and filters -->
    <div v-if="props.showHeader" class="d-flex align-center mb-4">
      <h2 class="text-h5 mr-auto">
        {{ props.parentId ? 'Related Issues' : 'Issues' }}
      </h2>
      
      <!-- Search filter -->
      <v-text-field
        v-model="filterText"
        density="compact"
        variant="outlined"
        label="Search issues"
        prepend-inner-icon="mdi-magnify"
        class="mr-2"
        style="max-width: 250px;"
        hide-details
      ></v-text-field>
      
      <!-- Automation filter -->
      <v-switch
        v-model="showAutomationOnly"
        color="primary"
        label="AI tasks only"
        hide-details
        class="ml-2"
      ></v-switch>
    </div>
    
    <!-- Create issue form -->
    <CreateIssueForm 
      :parentId="props.parentId"
      @created="handleIssueCreated"
    />
    
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    
    <!-- Error state -->
    <v-alert v-else-if="error" type="error" class="my-4">
      {{ error }}
    </v-alert>
    
    <!-- Empty state -->
    <v-card v-else-if="filteredIssues.length === 0" class="text-center pa-4 my-4" variant="outlined">
      <div class="text-body-1 py-4">No issues found</div>
    </v-card>
    
    <!-- Issues list -->
    <v-list density="compact" class="pa-0">
      <v-list-item
        v-for="issue in filteredIssues"
        :key="issue.id"
        :value="issue"
        @click="viewIssue(issue)"
        :class="{
          'border-l-4 border-purple': issue.isAutomation
        }"
        hover
      >
        <template v-slot:prepend>
          <v-icon :color="getStatusColor(issue.automationStatus)" size="small">
            {{ getStatusIcon(issue.automationStatus) }}
          </v-icon>
        </template>

        <v-list-item-title class="d-flex align-center">
          <span class="text-body-2">#{{ issue.number }}</span>
          <span class="text-body-2 ml-2">{{ issue.title }}</span>
        </v-list-item-title>

        <template v-slot:append>
          <v-chip
            v-if="issue.isAutomation"
            size="x-small"
            color="purple"
          >
            AI
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>