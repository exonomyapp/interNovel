<!-- components/IssueList.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useEventBus, EVENTS } from '../composables/useEventBus';
import CreateIssueForm from './CreateIssueForm.vue';

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
  parentId?: number;
}

// Define props
interface Props {
  parentId?: number;
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
const expandedParents = ref<Record<number, boolean>>({});

// Toggle parent expansion
const toggleParent = (issueId: number, event: Event) => {
  event.stopPropagation();
  expandedParents.value = {
    ...expandedParents.value,
    [issueId]: !expandedParents.value[issueId]
  };
};

// Filter and organize issues hierarchically
const hierarchicalIssues = computed(() => {
  const filtered = [...issues.value].filter(issue => {
    // Filter by search text
    if (filterText.value) {
      const searchLower = filterText.value.toLowerCase();
      if (!(
        issue.title.toLowerCase().includes(searchLower) || 
        issue.body.toLowerCase().includes(searchLower) ||
        issue.labels.some(label => label.toLowerCase().includes(searchLower))
      )) {
        return false;
      }
    }
    
    // Filter by automation
    if (showAutomationOnly.value && !issue.isAutomation) {
      return false;
    }
    
    return true;
  });

  // Build hierarchy
  const map: Record<number, Issue> = {};
  const roots: Issue[] = [];
  
  // Create a map of all issues
  filtered.forEach(issue => {
    map[issue.id] = { ...issue, children: [] };
  });
  
  // Build the tree structure
  filtered.forEach(issue => {
    if (issue.parentId && map[issue.parentId]) {
      map[issue.parentId].children?.push(map[issue.id]);
    } else {
      roots.push(map[issue.id]);
    }
  });
  
  return roots;
});

// Get issues from the API
const fetchIssues = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const endpoint = props.parentId 
      ? `/api?type=issues&parentId=${props.parentId}&showClosed=${props.showClosed}` 
      : `/api?type=issues&showClosed=${props.showClosed}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }
    
    const data = await response.json();
    
    issues.value = data.map((issue: Issue) => {
      const isAutomation = issue.labels.some(label => 
        label === 'automation' || label === 'ai-task'
      );
      
      return {
        ...issue,
        isAutomation,
        automationStatus: isAutomation ? (issue.automationStatus || 'pending') : undefined,
        automationPriority: isAutomation ? (issue.automationPriority || 'medium') : undefined,
        automationProgress: isAutomation ? (issue.automationProgress || 0) : undefined
      };
    });
    
  } catch (err: any) {
    console.error('Error fetching issues:', err);
    error.value = err.message || 'Failed to fetch issues';
  } finally {
    loading.value = false;
  }
};

// Utility methods
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
const getPriorityColor = (priority?: string) => {
  if (!priority) return '';
  switch (priority) {
    case 'high': return 'red';
    case 'medium': return 'blue';
    case 'low': return 'green';
    default: return 'grey';
  }
};
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
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

// View issue details
const viewIssue = (issue: Issue) => {
  emit('issue-selected', issue);
  emitEvent(EVENTS.ISSUE_SELECTED, issue);
  if (props.parentId) {
    router.push(`/issue/${issue.number}`);
  }
};

// Fetch issues on mount
onMounted(() => {
  fetchIssues();
});

defineExpose({ 
  refresh: fetchIssues 
});

// Register IssueItem as a recursive component
const IssueItem = defineComponent({
  name: 'IssueItem',
  props: {
    issue: { type: Object, required: true },
    level: { type: Number, default: 0 }
  },
  setup(props) {
    const hasChildren = computed(() => props.issue.children && props.issue.children.length > 0);
    const isExpanded = computed(() => expandedParents.value[props.issue.id] ?? false);
    return { hasChildren, isExpanded, toggleParent, getStatusColor, getStatusIcon, viewIssue, expandedParents };
  },
  template: `
    <v-list-item
      :value="issue"
      @click="viewIssue(issue)"
      :class="{
        'border-l-4 border-purple': issue.isAutomation,
      }"
      :style="{ 'padding-left': (16 + (level * 16)) + 'px' }"
      hover
    >
      <template v-slot:prepend>
        <v-icon
          v-if="hasChildren"
          @click.stop="toggleParent(issue.id, $event)"
          size="small"
          class="mr-1"
        >
          {{ isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
        </v-icon>
        <v-icon
          v-else
          size="small"
          class="mr-1"
          :color="getStatusColor(issue.automationStatus)"
        >
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
          class="mr-1"
        >
          AI
        </v-chip>
        <v-chip
          :color="issue.state === 'open' ? 'success' : 'error'"
          size="x-small"
        >
          {{ issue.state }}
        </v-chip>
      </template>
    </v-list-item>
    <div v-if="hasChildren && isExpanded" class="child-issues">
      <IssueItem v-for="child in issue.children" :key="child.id" :issue="child" :level="level + 1" />
    </div>
  `
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
    <v-card v-else-if="hierarchicalIssues.length === 0" class="text-center pa-4 my-4" variant="outlined">
      <div class="text-body-1 py-4">No issues found</div>
    </v-card>
    
    <!-- Issues list -->
    <v-list density="compact" class="pa-0">
      <template v-for="issue in hierarchicalIssues" :key="issue.id">
        <IssueItem :issue="issue" />
      </template>
    </v-list>
  </div>
</template>

<style scoped>
.child-issues {
  transition: all 0.3s ease;
}

.border-purple {
  border-color: rgb(186, 104, 200);
}

/* Add some visual hierarchy */
.v-list-item {
  transition: background-color 0.2s;
}

.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>