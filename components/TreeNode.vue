<!-- components/TreeNode.vue -->
<template>
  <div class="tree-item">
    <!-- Node content with toggle button -->
    <div class="tree-item-content">
      <v-btn
        v-if="node.children && node.children.length > 0"
        icon="mdi-chevron-right"
        size="x-small"
        variant="text"
        :class="{ 'rotate-90': expanded }"
        @click.stop="toggleExpand"
        class="expand-btn"
      />
      <v-btn
        v-else
        size="x-small"
        variant="text"
        icon="mdi-circle-small"
        disabled
        class="visibility-hidden placeholder-btn"
      />
      
      <div class="node-label">
        <span class="issue-number">{{ `#${node.number}` }}</span>
        <span class="issue-title">{{ node.title }}</span>
      </div>
    </div>
    
    <!-- Child nodes -->
    <div v-if="expanded && node.children && node.children.length > 0" class="tree-children">
      <TreeNode 
        v-for="child in node.children" 
        :key="child.id" 
        :node="child" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define props for the node
interface Props {
  node: {
    id: number;
    number: number;
    title: string;
    children?: any[];
  };
}

const props = defineProps<Props>();

// Track if node is expanded
const expanded = ref(false);

// Toggle expanded state
const toggleExpand = () => {
  expanded.value = !expanded.value;
};
</script>

<style scoped>
.tree-item {
  text-align: left;
  margin-bottom: 2px; /* Increased from 1px for better spacing between nodes */
}

.tree-item-content {
  display: flex;
  align-items: center;
  padding: 4px 6px; /* Increased padding for better clickable area */
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2px;
  min-height: 28px;
  transition: background-color 0.15s ease;
}

.tree-item-content:hover {
  background-color: rgba(0, 0, 0, 0.08); /* Slightly darker for better visibility */
}

.tree-item-content.selected {
  background-color: rgba(25, 118, 210, 0.15); /* Slightly more pronounced selected state */
}

.tree-children {
  padding-left: 20px; /* Slightly increased for better hierarchy */
  margin-top: 2px;
  border-left: 1px dashed rgba(0, 0, 0, 0.12); /* Slightly darker for better visibility */
}

.node-label {
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.875rem;
  line-height: 1.3; /* Improved line height for better readability */
  margin-left: 6px; /* Slightly increased for better spacing */
}

.issue-number {
  font-weight: 500;
  margin-right: 8px; /* Increased spacing between number and title */
  color: rgba(0, 0, 0, 0.65); /* Slightly darker for better readability */
  flex-shrink: 0;
}

.issue-title {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%; /* Ensures text truncation works properly */
}

.rotate-90 {
  transform: rotate(90deg);
  transition: transform 0.2s ease;
}

.visibility-hidden {
  visibility: hidden;
}

.expand-btn, .placeholder-btn {
  margin: 0;
  padding: 0;
  min-width: 24px;
  height: 24px;
  flex-shrink: 0;
}
</style>