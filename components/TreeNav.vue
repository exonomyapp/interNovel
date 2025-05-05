<!-- components/TreeNav.vue -->
<template>
  <div class="d-flex flex-column">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between px-2 py-1 border-bottom">
      <div class="font-weight-medium">Issues Tree</div>
      <v-btn @click="reload" size="small" variant="text" color="primary">
        <v-icon size="small">mdi-reload</v-icon>
        <span class="ms-1">Refresh</span>
      </v-btn>
    </div>
    
    <!-- Content -->
    <div class="flex-grow-1 d-flex flex-column position-relative">
      <!-- Loading overlay -->
      <div v-show="isLoading" class="position-absolute w-100" style="z-index: 1">
        <v-progress-linear
          indeterminate
          color="primary"
          height="2"
        ></v-progress-linear>
      </div>
      
      <!-- Tree content -->
      <div class="flex-grow-1 overflow-y-auto">
        <div class="pa-2">
          <v-alert v-if="error" type="error" :text="errorMessage" density="compact"></v-alert>
          
          <v-alert v-else-if="!treeItems.length" type="info" text="No issues found" density="compact"></v-alert>
          
          <div v-else class="tree-items">
            <div
              v-for="item in treeItems"
              :key="item.id"
              class="tree-item"
              :class="{ 'selected': selectedNodeId === item.raw.id }"
              @click="selectItem(item)"
            >
              <div class="d-flex align-center">
                <v-icon :color="getStatusColor(item.raw)" size="small" class="mr-2">
                  {{ getStatusIcon(item.raw) }}
                </v-icon>
                <span class="text-body-2">#{{ item.raw.number }}</span>
                <span class="text-body-2 ml-2">{{ item.raw.title }}</span>
                <v-chip
                  v-if="isAutomationIssue(item.raw)"
                  size="x-small"
                  color="purple"
                  class="ml-auto"
                >
                  AI
                </v-chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Issue } from '../types';
import { useEventBus, EVENTS } from '../composables/useEventBus';

interface TreeItem {
  id: number;
  title: string;
  raw: Issue;
}

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

// Fetch issues from the backend API
async function fetchIssues() {
  isLoading.value = true;
  error.value = null;
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`/api?type=issues&_=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
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
  if (issue.state === 'closed') return 'success';
  if (isAutomationIssue(issue)) return 'purple';
  return 'primary';
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
onMounted(async () => {
  await fetchIssues();
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
.tree-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tree-item {
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tree-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.tree-item.selected {
  background-color: rgb(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}
</style>