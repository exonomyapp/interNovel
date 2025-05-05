<template>
  <div class="log-viewer">
    <div class="log-header d-flex align-center px-2 py-1">
      <span class="text-subtitle-2">System Logs</span>
      <v-spacer></v-spacer>
      <v-btn
        size="small"
        variant="text"
        icon="mdi-refresh"
        @click="refreshLogs"
      ></v-btn>
    </div>
    <div class="log-content" ref="logContainer">
      <v-list density="compact" class="log-list">
        <v-list-item
          v-for="log in logs"
          :key="log.id"
          :class="['log-item', `log-${log.type}`]"
        >
          <div class="d-flex align-center">
            <v-icon
              size="small"
              :icon="getIconForType(log.type)"
              :color="getColorForType(log.type)"
              class="mr-2"
            ></v-icon>
            <div class="log-info">
              <div class="d-flex align-center">
                <span class="text-caption text-medium-emphasis">{{ formatTimestamp(log.timestamp) }}</span>
                <span class="text-caption text-medium-emphasis ml-2">[{{ log.source }}]</span>
              </div>
              <div class="log-message">{{ log.message }}</div>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getLogs, addLogEntry } from '../server/db';
import type { LogEntry } from '../server/db';

const logs = ref<LogEntry[]>([]);
const logContainer = ref<HTMLElement | null>(null);
const refreshInterval = ref<NodeJS.Timeout>();

// Function to get icon based on log type
const getIconForType = (type: string) => {
  switch (type) {
    case 'info': return 'mdi-information';
    case 'error': return 'mdi-alert-circle';
    case 'warning': return 'mdi-alert';
    case 'debug': return 'mdi-bug';
    default: return 'mdi-text';
  }
};

// Function to get color based on log type
const getColorForType = (type: string) => {
  switch (type) {
    case 'info': return 'info';
    case 'error': return 'error';
    case 'warning': return 'warning';
    case 'debug': return 'grey';
    default: return 'default';
  }
};

// Format timestamp to local time
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// Fetch logs from both server and IndexedDB
const refreshLogs = async () => {
  try {
    // Fetch new logs from server
    const response = await fetch('/api/logs');
    if (response.ok) {
      const serverLogs = await response.json();
      // Add new logs to IndexedDB
      for (const log of serverLogs) {
        await addLogEntry(log);
      }
    }
    
    // Get all logs from IndexedDB
    logs.value = await getLogs(50);
    
    // Scroll to bottom if we're already at the bottom
    if (logContainer.value) {
      const { scrollHeight, clientHeight, scrollTop } = logContainer.value;
      if (scrollHeight - clientHeight - scrollTop < 50) {
        setTimeout(() => {
          if (logContainer.value) {
            logContainer.value.scrollTop = logContainer.value.scrollHeight;
          }
        }, 0);
      }
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
};

// Setup auto-refresh
onMounted(() => {
  refreshLogs();
  refreshInterval.value = setInterval(refreshLogs, 2000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<style scoped>
.log-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.log-header {
  flex: 0 0 auto;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.log-content {
  flex: 1;
  overflow-y: auto;
  background: rgb(var(--v-theme-surface));
}

.log-list {
  padding: 0;
}

.log-item {
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease;
}

.log-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.log-item.log-error {
  border-left-color: rgb(var(--v-theme-error));
}

.log-item.log-warning {
  border-left-color: rgb(var(--v-theme-warning));
}

.log-item.log-info {
  border-left-color: rgb(var(--v-theme-info));
}

.log-item.log-debug {
  border-left-color: rgb(var(--v-theme-grey-darken-1));
}

.log-info {
  flex: 1;
  min-width: 0;
}

.log-message {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>