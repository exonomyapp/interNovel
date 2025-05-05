<!-- components/CreateIssueForm.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';

// Form state
const form = ref({
  title: '',
  body: '',
  labels: [],
});
const isSubmitting = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Define props
interface Props {
  parentId?: number; // Optional parent issue passed from parent component
}

const props = defineProps<Props>();

// Define emits
const emit = defineEmits(['issue-created', 'created']);

// Available labels
const availableLabels = ['bug', 'feature', 'documentation', 'enhancement'];

// Title validation rules
const titleRules = [(v: string) => !!v || 'Title is required.'];

// Submit form
const submitForm = async () => {
  if (!form.value.title) {
    error.value = 'Title is required.';
    return;
  }

  isSubmitting.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const payload = {
      title: form.value.title,
      body: form.value.body,
      labels: form.value.labels,
    };

    // Send the request to create an issue
    const response = await $fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Clear form
    form.value.title = '';
    form.value.body = '';
    form.value.labels = [];
    
    successMessage.value = `Successfully created issue!`;

    // Emit events
    emit('issue-created');
    emit('created', response);

  } catch (err: any) {
    console.error('Error creating issue:', err);
    error.value = `Failed to create issue: ${err.data?.message || err.message || 'Unknown error'}`;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <v-card class="mb-6 mt-4" variant="outlined">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-plus-circle" class="mr-2"></v-icon>
      Create New Issue
    </v-card-title>
    
    <v-card-text>
      <v-form @submit.prevent="submitForm">
        <v-text-field
          v-model="form.title"
          label="Title"
          :rules="titleRules"
          required
          class="mb-2"
        ></v-text-field>

        <v-textarea
          v-model="form.body"
          label="Description"
          rows="4"
          class="mb-2"
        ></v-textarea>

        <v-select
          v-model="form.labels"
          :items="availableLabels"
          label="Labels"
          multiple
          chips
          class="mb-4"
        ></v-select>

        <div class="d-flex justify-end gap-2">
          <v-btn
            color="primary"
            type="submit"
            :loading="isSubmitting"
            :disabled="!form.title"
          >
            Create Issue
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
    
    <!-- Success/error messages -->
    <v-card-text>
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
    </v-card-text>
  </v-card>
</template>

<style scoped>
</style>