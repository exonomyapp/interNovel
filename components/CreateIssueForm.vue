<!-- components/CreateIssueForm.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';

// Form state
const title = ref('');
const body = ref('');
const parentId = ref<number | null>(null);
const isAutomation = ref(false);
const automationPriority = ref('medium');
const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const showAutomationTemplate = ref(false);

// Define props
interface Props {
  parentId?: number; // Optional parent issue passed from parent component
}

const props = defineProps<Props>();

// Set parentId if provided via props
if (props.parentId) {
  parentId.value = props.parentId;
}

// Define emits
const emit = defineEmits(['issue-created', 'created']);

// Automation template for the body
const automationTemplate = `## Automation Task

### Description
[Describe what the AI should do]

### Technical Details
[Provide any technical details, file paths, or specific implementation requirements]

### Success Criteria
[Define what constitutes successful completion]

### Priority
${automationPriority.value}

Status: pending
`;

// Apply template to body when toggling automation
const toggleAutomation = () => {
  if (isAutomation.value && !body.value) {
    body.value = automationTemplate;
    showAutomationTemplate.value = true;
  } else if (!isAutomation.value && showAutomationTemplate.value) {
    body.value = '';
    showAutomationTemplate.value = false;
  }
};

// Update template when priority changes
const updateTemplate = () => {
  if (showAutomationTemplate.value) {
    body.value = automationTemplate.replace(
      /Priority\n(low|medium|high)/i,
      `Priority\n${automationPriority.value}`
    );
  }
};

// Define an interface for the expected GitHub issue response shape
interface GitHubIssueResponse {
  number: number;
  [key: string]: any; // Allow other properties
}

// Watch for priority changes
watch(automationPriority, () => {
  updateTemplate();
});

// Create a new issue
const createIssue = async () => {
  if (!title.value) {
    error.value = 'Title is required.';
    return;
  }

  isLoading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const payload: {
      title: string;
      body?: string;
      parentId?: number;
      labels?: string[];
    } = {
      title: title.value,
    };
    
    if (body.value) {
      payload.body = body.value;
    }
    
    // Only include parentId if it's a valid number
    const parentNum = parentId.value !== null && !isNaN(parentId.value) ? Number(parentId.value) : undefined;
    if (parentNum !== undefined) {
      payload.parentId = parentNum;
    }
    
    // Add labels for automation issues
    if (isAutomation.value) {
      payload.labels = ['automation', 'ai-task', `priority:${automationPriority.value}`];
    }

    // Send the request to create an issue
    const response = await $fetch<GitHubIssueResponse>('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Clear form
    title.value = '';
    body.value = '';
    parentId.value = props.parentId || null;
    isAutomation.value = false;
    showAutomationTemplate.value = false;
    automationPriority.value = 'medium';
    
    successMessage.value = `Successfully created issue #${response.number}!`;

    // Add the automation status to the response if it's an automation issue
    if (isAutomation.value) {
      response.isAutomation = true;
      response.automationStatus = 'pending';
      response.automationPriority = automationPriority.value;
    }

    // Emit both events for backward compatibility
    emit('issue-created');
    emit('created', response);

  } catch (err: any) {
    console.error('Error creating issue:', err);
    error.value = `Failed to create issue: ${err.data?.message || err.message || 'Unknown error'}`;
  } finally {
    isLoading.value = false;
  }
};

// Computed boolean for form validity
const isFormValid = computed(() => !!title.value);
</script>

<template>
  <v-card class="mb-6 mt-4" variant="outlined">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-plus-circle" class="mr-2"></v-icon>
      Create New Issue
      <v-switch
        v-model="isAutomation"
        color="primary"
        label="AI Automation"
        class="ml-auto"
        hide-details
        @update:model-value="toggleAutomation"
      ></v-switch>
    </v-card-title>
    
    <v-card-text>
      <v-form @submit.prevent="createIssue">
        <!-- Issue title -->
        <v-text-field
          v-model="title"
          label="Title *"
          required
          :disabled="isLoading"
          variant="outlined"
          :hint="isAutomation ? 'Start with [AI] for better visibility' : ''"
          persistent-hint
        ></v-text-field>
        
        <!-- Parent issue ID -->
        <v-text-field
          v-model.number="parentId"
          label="Parent Issue # (Optional)"
          type="number"
          :disabled="isLoading || !!props.parentId"
          variant="outlined"
          class="mt-2"
          hint="Link this issue to a parent issue"
          persistent-hint
        ></v-text-field>
        
        <!-- Automation priority selector (only shown for automation issues) -->
        <v-select
          v-if="isAutomation"
          v-model="automationPriority"
          label="Priority"
          :items="['low', 'medium', 'high']"
          variant="outlined"
          class="mt-2"
          :disabled="isLoading"
        ></v-select>
        
        <!-- Issue body -->
        <v-textarea
          v-model="body"
          label="Description"
          rows="6"
          auto-grow
          :disabled="isLoading"
          variant="outlined"
          class="mt-2"
          :hint="isAutomation ? 'Follow the template for best results with AI processing' : ''"
          persistent-hint
        ></v-textarea>
        
        <!-- Submit button -->
        <v-btn
          color="primary"
          type="submit"
          class="mt-4"
          :loading="isLoading"
          :disabled="!isFormValid"
          block
        >
          {{ isLoading ? 'Creating...' : 'Create Issue' }}
        </v-btn>
        
        <!-- Success/error messages -->
        <v-alert
          v-if="error"
          type="error"
          class="mt-4"
          variant="tonal"
          closable
        >
          {{ error }}
        </v-alert>
        
        <v-alert
          v-if="successMessage"
          type="success"
          class="mt-4"
          variant="tonal"
          closable
        >
          {{ successMessage }}
        </v-alert>
      </v-form>
    </v-card-text>
    
    <!-- Information about automation issues when that option is selected -->
    <v-card-text v-if="isAutomation" class="automation-info mt-n4">
      <v-alert type="info" variant="tonal">
        <template v-slot:prepend>
          <v-icon icon="mdi-robot"></v-icon>
        </template>
        <p>
          <strong>Creating an AI Automation Issue</strong><br>
          This issue will be processed by the AI automation system. Follow these tips:
        </p>
        <ul class="mt-2">
          <li>Be specific about what needs to be done</li>
          <li>Provide file paths when relevant</li>
          <li>Define clear success criteria</li>
          <li>Set appropriate priority</li>
        </ul>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.automation-info {
  background-color: rgba(25, 118, 210, 0.05);
}
</style>