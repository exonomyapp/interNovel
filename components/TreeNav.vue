<!-- components/TreeNav.vue -->
<template>
  <div class="tree-nav gh-box">
    <!-- Header -->
    <div class="gh-header">
      <div class="d-flex align-center justify-space-between">
        <div class="gh-title">Issues</div>
        <v-btn 
          @click="reload" 
          size="small" 
          variant="text" 
          class="gh-button"
          :loading="isLoading"
        >
          <v-icon size="small">mdi-reload</v-icon>
          <span class="ms-1">Refresh</span>
        </v-btn>
      </div>
    </div>
    
    <!-- Content -->
    <div class="tree-nav-content">
      <!-- Loading overlay -->
      <div v-show="isLoading" class="tree-nav-loader">
        <v-progress-linear
          indeterminate
          color="primary"
          height="2"
        ></v-progress-linear>
      </div>
      
      <!-- Tree content -->
      <div class="tree-content-scroll">
        <div class="pa-4">
          <v-alert v-if="!repository" type="info" text="Select a repository to view issues" density="compact" class="gh-alert"></v-alert>
          
          <v-alert v-else-if="error" type="error" :text="errorMessage" density="compact" class="gh-alert"></v-alert>
          
          <v-alert v-else-if="!treeItems.length" type="info" text="No issues found" density="compact" class="gh-alert"></v-alert>
          
          <div v-else class="tree-items">
            <div
              v-for="item in treeItems"
              :key="item.id"
              class="gh-list-item"
              :class="{ 'selected': selectedNodeId === item.raw.id }"
              @click="selectItem(item)"
            >
              <div class="d-flex align-center">
                <v-icon 
                  :color="getStatusColor(item.raw)" 
                  size="small" 
                  class="mr-2"
                >
                  {{ getStatusIcon(item.raw) }}
                </v-icon>
                <span class="gh-text-mono mr-2">#{{ item.raw.number }}</span>
                <span class="gh-subtitle flex-grow-1">{{ item.raw.title }}</span>
                <div
                  v-if="isAutomationIssue(item.raw)"
                  class="gh-tag ml-2"
                >
                  AI
                </div>
                <div
                  class="gh-tag ml-2"
                  :class="item.raw.state"
                >
                  {{ item.raw.state }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Issue } from '../types';
import { useEventBus, EVENTS } from '../composables/useEventBus';

interface TreeItem {
  id: number;
  title: string;
  raw: Issue;
}

interface Props {
  repository?: string;
}

const props = defineProps<Props>();

const selectedNodeId = ref<number | null>(null);
const emit = defineEmits<{
  'issue-selected': [Issue | null]
}>();

const issues = ref<Issue[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);
const errorMessage = computed(() => {
  if (!error.value) return '';
  return `Failed to load issues: ${error.value.message}`;
});

// Get the event bus
const { on } = useEventBus();

// Track the unsubscribe functions
const unsubscribes: Function[] = [];

// Watch for repository changes
watch(() => props.repository, () => {
  if (props.repository) {
    fetchIssues();
  } else {
    issues.value = [];
    selectedNodeId.value = null;
    emit('issue-selected', null);
  }
}, { immediate: true });

// Fetch issues from the backend API
async function fetchIssues() {
  if (!props.repository) return;
  
  isLoading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('github_access_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`https://api.github.com/repos/${props.repository}/issues?state=all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    const fetchedData = await response.json();
    console.log('Fetched Issues (TreeNav):', fetchedData);
    
    if (!Array.isArray(fetchedData)) {
      throw new Error('Invalid data format: expected an array of issues');
    }
    
    issues.value = fetchedData;
  } catch (err) {
    console.error('Error fetching issues for TreeNav:', err);
    error.value = err instanceof Error ? err : new Error(String(err));
    issues.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Simplified tree items without nesting
const treeItems = computed<TreeItem[]>(() => {
  return issues.value.map(issue => ({
    id: issue.id,
    title: issue.title,
    raw: issue
  }));
});

const getStatusColor = (issue: Issue) => {
  if (issue.state === 'closed') return 'var(--gh-closed-emphasis)';
  if (isAutomationIssue(issue)) return 'var(--gh-merged-emphasis)';
  return 'var(--gh-open-emphasis)';
};

const getStatusIcon = (issue: Issue) => {
  if (issue.state === 'closed') return 'mdi-check-circle';
  if (isAutomationIssue(issue)) return 'mdi-robot';
  return 'mdi-circle-medium';
};

const isAutomationIssue = (issue: Issue) => {
  return issue.labels?.some(label => label.toLowerCase() === 'ai-task');
};

// Simple selection handling
const selectItem = (item: TreeItem) => {
  if (selectedNodeId.value === item.raw.id) {
    // Deselect if clicking the same item
    selectedNodeId.value = null;
    emit('issue-selected', null);
  } else {
    // Select new item
    selectedNodeId.value = item.raw.id;
    emit('issue-selected', item.raw);
  }
};

// Lifecycle hooks
onMounted(() => {
  unsubscribes.push(on(EVENTS.RELOAD_DATA, fetchIssues));
  unsubscribes.push(on(EVENTS.REFRESH_DATA, fetchIssues));
});

onUnmounted(() => {
  unsubscribes.forEach(unsubscribe => unsubscribe());
});

// Expose reload method
const reload = () => {
  fetchIssues();
};

defineExpose({ 
  reload
});
</script>

<style scoped>
.tree-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-nav-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tree-content-scroll {
  flex: 1;
  overflow-y: auto;
}

.tree-nav-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.gh-list-item {
  border-radius: 6px;
  margin-bottom: 1px;
}

.gh-list-item:hover {
  background-color: var(--gh-bg-subtle);
}

.gh-list-item.selected {
  background-color: var(--gh-accent-muted);
}

.gh-list-item.selected .gh-subtitle {
  color: var(--gh-accent-fg);
  font-weight: 500;
}

.gh-alert {
  background-color: var(--gh-bg-subtle) !important;
  color: var(--gh-fg-muted) !important;
  border: 1px solid var(--gh-border-default) !important;
}

.gh-tag.open {
  background-color: var(--gh-success-muted);
  color: var(--gh-success-fg);
}

.gh-tag.closed {
  background-color: var(--gh-danger-muted);
  color: var(--gh-danger-fg);
}
</style>