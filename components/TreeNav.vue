<!-- components/TreeNav.vue -->
<template>
  <div class="tree-nav">
    <div class="tree-header">
      <div class="font-weight-medium">Issues Tree</div>
      
      <!-- Filter toolbar -->
      <div class="filter-toolbar">
        <v-checkbox
          v-model="showClosedIssues"
          label="Show Closed"
          density="compact"
          hide-details
        ></v-checkbox>
        <v-checkbox
          v-model="tasksOnly"
          label="Tasks Only"
          density="compact"
          hide-details
        ></v-checkbox>
        <v-checkbox
          v-model="myIssuesOnly"
          label="My Issues"
          density="compact"
          hide-details
        ></v-checkbox>
      </div>
      
      <v-btn @click="reload" size="small" variant="text" color="primary" class="reload-btn">
        <v-icon size="small">mdi-reload</v-icon>
        <span class="ms-1">Refresh</span>
      </v-btn>
    </div>
    
    <v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>
    
    <v-alert v-else-if="error" type="error" title="Error" :text="errorMessage" density="compact"></v-alert>
    
    <div v-if="!isLoading && !error && issueTree.length > 0" class="tree-root">
      <!-- Use the TreeNode component to render the tree -->
      <TreeNode v-for="node in filteredIssueTree" :key="node.id" :node="node" />
    </div>
    
    <v-alert v-else-if="!isLoading && !error" type="info" text="No issues found" density="compact"></v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue';
import TreeNode from './TreeNode.vue';
import type { Issue, TreeNodeData } from '../types'; // Updated import path
import { useEventBus, EVENTS } from '../composables/useEventBus';

// Filter states - keeping these for the filtering logic in computed properties
// but removing the checkboxes from the UI
const showClosedIssues = ref(false);
const tasksOnly = ref(false);
const myIssuesOnly = ref(false);

const issues = ref<Issue[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);
const errorMessage = computed(() => error.value ? `Failed to load issue tree: ${error.value.message}` : '');

// Track the selected node ID
const selectedNodeId = ref<number | null>(null);

// Provide selectedNodeId to child components
provide('selectedNodeId', selectedNodeId);

// Get the event bus
const { on, emit } = useEventBus();

// Track the unsubscribe functions
const unsubscribes: Function[] = [];

// Fetch issues from the backend API and include explicit debug information
async function fetchIssues() {
  isLoading.value = true;
  error.value = null;
  try {
    // Add timestamp to URL to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/api?type=issues&_=${timestamp}`, {
      // Add cache-busting to ensure we get fresh data
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
    
    // Validate the data structure
    if (!Array.isArray(fetchedData)) {
      throw new Error('Invalid data format: expected an array of issues');
    }
    
    // Debug: Log raw issue data to inspect parentId values
    console.log('Raw issue data for debugging:');
    fetchedData.forEach((issue: any) => {
      console.log(`Issue #${issue.number}:`, {
        id: issue.id,
        parentId: issue.parentId,
        body: issue.body?.substring(0, 100) + (issue.body?.length > 100 ? '...' : '')
      });
    });
    
    issues.value = fetchedData;
  } catch (err) {
    console.error('Error fetching issues for TreeNav:', err);
    error.value = err instanceof Error ? err : new Error(String(err));
    issues.value = []; // Clear issues on error
  } finally {
    isLoading.value = false;
  }
}

// Build the tree structure
const issueTree = computed((): TreeNodeData[] => {
  if (!issues.value.length) return [];
  
  const nodes: TreeNodeData[] = [];
  const issuesMap = new Map<number, TreeNodeData>();

  // First pass: create nodes and map them by ID
  issues.value.forEach((issue: Issue) => {
    // Ensure required fields exist
    if (typeof issue.id !== 'number') {
      console.warn('Issue missing ID:', issue);
      return;
    }
    
    const node: TreeNodeData = {
      id: issue.id,
      number: issue.number || issue.id, // Fallback to id if number is missing
      title: issue.title || 'Untitled Issue',
      parentId: issue.parentId || undefined, // Ensure parentId is undefined if not present
      children: [],
      state: issue.state, // Add state property for filtering
      labels: issue.labels || [], // Add labels for filtering
      author: issue.author || '', // Add author for filtering
    };
    issuesMap.set(issue.id, node);
  });

  // Second pass: build the tree structure using parentId
  issuesMap.forEach(issueNode => {
    if (issueNode.parentId) {
      // Try to find parent by ID
      const parentNode = issuesMap.get(issueNode.parentId);
      
      if (parentNode) {
        parentNode.children.push(issueNode);
        console.log(`Added issue #${issueNode.number} as child of #${parentNode.number} (found by ID)`);
      } else {
        // If parent not found by ID, add to root nodes
        nodes.push(issueNode);
        console.log(`Parent node for issue #${issueNode.number} not found, added to root`);
      }
    } else {
      // Root nodes (no parent)
      nodes.push(issueNode);
      console.log(`Issue #${issueNode.number} added as root node (no parent)`);
    }
  });

  // Third pass: Check for child references in issue bodies
  // This is a fallback for when parentId relationships aren't established
  issues.value.forEach(issue => {
    if (!issue.body) return;
    
    // Look for task list items in the body that reference other issues
    // For example: "- [ ] #3" or "- [x] #2"
    const taskListPattern = /(?:^|\n)\s*-\s*\[[ x]\]\s*#(\d+)/g;
    const bodyText = issue.body;
    
    let match;
    while ((match = taskListPattern.exec(bodyText)) !== null) {
      const childNumber = parseInt(match[1], 10);
      
      // Skip if this is a self-reference or if childNumber is invalid
      if (isNaN(childNumber) || childNumber === issue.number) continue;
      
      // Find the child node by number
      const childNode = Array.from(issuesMap.values()).find(node => node.number === childNumber);
      if (!childNode) continue;
      
      // Find the parent node by this issue's number
      const parentNode = issuesMap.get(issue.id);
      if (!parentNode) continue;
      
      // If the child node is currently a root node and doesn't have a parentId set,
      // move it under this parent
      if (!childNode.parentId) {
        // Remove from root if it's there
        const rootIndex = nodes.findIndex(node => node.id === childNode.id);
        if (rootIndex !== -1) {
          nodes.splice(rootIndex, 1);
        }
        
        // Add as child to this parent
        parentNode.children.push(childNode);
        console.log(`Added issue #${childNode.number} as child of #${parentNode.number} (from task list in body)`);
      }
    }
  });

  // Sort nodes
  const sortNodes = (nodeList: TreeNodeData[]) => {
    nodeList.sort((a, b) => (a.number || 0) - (b.number || 0));
    nodeList.forEach(node => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };
  
  sortNodes(nodes);
  
  console.log('Generated Issue Tree (TreeNav):', nodes);
  return nodes;
});

// Filtered tree based on filter settings
const filteredIssueTree = computed(() => {
  let result = [...issueTree.value];
  
  // Filter function that applies our filtering criteria
  const filterNodes = (nodes: TreeNodeData[]): TreeNodeData[] => {
    return nodes.filter(node => {
      // Filter by closed status
      if (!showClosedIssues.value && node.state === 'closed') {
        return false;
      }
      
      // Filter by tasks only (contains task-related label)
      if (tasksOnly.value && 
          !(node.labels?.some(label => 
            ['task', 'todo', 'ai-task'].includes(label.toLowerCase())))) {
        return false;
      }
      
      // Filter by my issues only
      if (myIssuesOnly.value && node.author !== 'Demo User') {
        return false;
      }
      
      // Process children recursively
      if (node.children && node.children.length > 0) {
        node.children = filterNodes([...node.children]);
      }
      
      return true;
    });
  };
  
  return filterNodes(result);
});

onMounted(() => {
  fetchIssues();
  
  // Subscribe to issue update events to refresh the tree
  unsubscribes.push(on(EVENTS.RELOAD_DATA, () => {
    console.log('Tree reload event received, refreshing issue tree...');
    fetchIssues();
  }));
  
  // Listen for REFRESH_DATA events (more targeted refresh for just the TreeNav)
  unsubscribes.push(on(EVENTS.REFRESH_DATA, () => {
    console.log('Tree refresh event received, refreshing TreeNav component...');
    fetchIssues();
  }));
  
  // Listen for issue selection events
  unsubscribes.push(on(EVENTS.ISSUE_SELECTED, (issue: Issue) => {
    selectedNodeId.value = issue.id;
  }));
});

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  unsubscribes.forEach(unsubscribe => unsubscribe());
});

// Expose a reload method
const reload = () => {
  emit(EVENTS.REFRESH_DATA);
};

defineExpose({ 
  reload,
  showClosedIssues,
  tasksOnly,
  myIssuesOnly
});
</script>

<style scoped>
.tree-nav {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.filter-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.filter-toolbar :deep(.v-selection-control) {
  margin-bottom: 0;
}

.filter-toolbar :deep(.v-label) {
  opacity: 0.8;
  font-size: 0.8rem;
}

.tree-root {
  padding: 4px 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.reload-btn {
  min-width: auto;
}
</style>