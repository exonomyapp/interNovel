// composables/useEventBus.ts
import { ref } from 'vue';

// Simple event bus for inter-component communication
const listeners: Record<string, Function[]> = {};

export function useEventBus() {
  const emit = (event: string, ...args: any[]) => {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback(...args));
    }
  };

  const on = (event: string, callback: Function) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      const idx = listeners[event].indexOf(callback);
      if (idx > -1) {
        listeners[event].splice(idx, 1);
      }
    };
  };

  return {
    emit,
    on
  };
}

// Pre-defined events
export const EVENTS = {
  ISSUE_UPDATED: 'issue:updated',
  REFRESH_DATA: 'data:refresh',
  RELOAD_DATA: 'data:reload',
  ISSUE_SELECTED: 'issue:selected',
  SHOW_CREATE_FORM: 'ui:show-create-form',
  ISSUE_CREATED: 'issue:created',
  COMMENT_ADDED: 'comment:added',
  COMMENT_UPDATED: 'comment:updated',
  REFRESH_TREE: 'tree:refresh',  // Added missing event
  PREFERENCES_CHANGED: 'preferences:changed' // Added for user preferences updates
};