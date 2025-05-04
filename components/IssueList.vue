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
    <div v-else class="issues-container" :style="{ maxHeight: props.maxHeight, overflow: props.maxHeight ? 'auto' : 'visible' }">
      <v-card
        v-for="issue in filteredIssues"
        :key="issue.id"
        class="mb-3 issue-card"
        :class="{ 'automation-issue': issue.isAutomation }"
        variant="outlined"
        @click="viewIssue(issue)"
      >
        <v-card-item>
          <!-- Issue title with issue number -->
          <div class="d-flex align-center mb-2">
            <!-- Automation indicator icon -->
            <v-icon 
              v-if="issue.isAutomation" 
              :color="getStatusColor(issue.automationStatus)"
              :icon="getStatusIcon(issue.automationStatus)"
              class="mr-2"
              size="small"
            ></v-icon>
            
            <v-card-title class="text-h6 pa-0">
              #{{ issue.number }}: {{ issue.title }}
            </v-card-title>
          </div>
          
          <!-- Issue metadata -->
          <v-card-subtitle class="pa-0 pt-1">
            <span>Created: {{ formatDate(issue.created_at) }}</span>
            <span class="mx-2">|</span>
            <span>Updated: {{ formatDate(issue.updated_at) }}</span>
            <span class="mx-2">|</span>
            <span class="text-capitalize">State: {{ issue.state }}</span>
          </v-card-subtitle>
          
          <!-- Issue labels -->
          <div class="d-flex flex-wrap mt-2">
            <v-chip
              v-for="label in issue.labels"
              :key="label"
              size="small"
              class="mr-1 mb-1"
              :color="label === 'automation' || label === 'ai-task' ? 'purple' : undefined"
              variant="outlined"
            >
              {{ label }}
            </v-chip>
          </div>
          
          <!-- Automation metadata if applicable -->
          <div v-if="issue.isAutomation" class="automation-metadata mt-3 pa-2">
            <div class="d-flex align-center">
              <v-icon icon="mdi-robot" class="mr-2" size="small"></v-icon>
              <span class="text-subtitle-2">AI Automation Task</span>
              
              <v-chip
                v-if="issue.automationPriority"
                size="x-small"
                class="ml-auto"
                :color="getPriorityColor(issue.automationPriority)"
              >
                {{ issue.automationPriority }} priority
              </v-chip>
            </div>
            
            <!-- Progress bar -->
            <div v-if="issue.automationStatus !== 'pending'" class="mt-2">
              <div class="d-flex align-center">
                <span class="text-caption">Progress:</span>
                <span class="text-caption ml-auto">{{ issue.automationProgress || 0 }}%</span>
              </div>
              <v-progress-linear
                :model-value="issue.automationProgress || 0"
                :color="getStatusColor(issue.automationStatus)"
                height="8"
              ></v-progress-linear>
            </div>
            
            <!-- Status chip -->
            <v-chip
              size="small"
              class="mt-2"
              :color="getStatusColor(issue.automationStatus)"
            >
              {{ issue.automationStatus || 'pending' }}
            </v-chip>
          </div>
        </v-card-item>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.automation-issue {
  border-left: 4px solid #9c27b0 !important;
}

.automation-metadata {
  background-color: rgba(156, 39, 176, 0.05);
  border-radius: 4px;
}

.issue-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.issue-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px);
}
</style>