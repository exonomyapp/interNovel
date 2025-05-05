<template>
  <v-card-text>
    <div class="d-flex align-center justify-space-between mb-4">
      <span class="text-h6">Comments</span>
      <v-btn
        color="primary"
        size="small"
        :disabled="!issue"
        @click="showCommentForm = true"
      >
        Add Comment
      </v-btn>
    </div>

    <!-- Comment form -->
    <v-expand-transition>
      <div v-show="showCommentForm">
        <v-textarea
          v-model="newComment"
          label="Add a comment"
          variant="outlined"
          rows="3"
          hide-details
          class="mb-2"
          :disabled="isSubmitting"
        ></v-textarea>
        
        <div class="d-flex justify-end gap-2 mb-4">
          <v-btn
            variant="text"
            @click="cancelComment"
            :disabled="isSubmitting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="submitComment"
            :loading="isSubmitting"
            :disabled="!newComment.trim()"
          >
            Submit
          </v-btn>
        </div>
      </div>
    </v-expand-transition>

    <!-- Comments list -->
    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <div v-else-if="comments.length" class="comments-list">
      <v-card
        v-for="comment in comments"
        :key="comment.id"
        variant="outlined"
        class="mb-3"
      >
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar size="32" color="grey-lighten-3">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </template>
          <v-card-title>{{ comment.author }}</v-card-title>
          <v-card-subtitle>{{ formatDate(comment.createdAt) }}</v-card-subtitle>
        </v-card-item>
        <v-card-text>{{ comment.body }}</v-card-text>
      </v-card>
    </div>

    <v-alert
      v-else
      type="info"
      variant="tonal"
      density="comfortable"
    >
      No comments yet
    </v-alert>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Issue, Comment } from '../types';

const props = defineProps<{
  issue?: Issue
}>();

const comments = ref<Comment[]>([]);
const newComment = ref('');
const isLoading = ref(false);
const isSubmitting = ref(false);
const showCommentForm = ref(false);

// Load comments when issue changes
watch(() => props.issue?.number, async (newNumber) => {
  if (!newNumber) {
    comments.value = [];
    return;
  }
  await fetchComments(newNumber);
});

async function fetchComments(issueNumber: number) {
  isLoading.value = true;
  try {
    const response = await fetch(`/api?type=comments&issueNumber=${issueNumber}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    comments.value = await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    comments.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function submitComment() {
  if (!props.issue || !newComment.value.trim()) return;
  
  isSubmitting.value = true;
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'comment',
        issueNumber: props.issue.number,
        content: newComment.value
      })
    });
    
    if (!response.ok) throw new Error('Failed to add comment');
    
    await fetchComments(props.issue.number);
    newComment.value = '';
    showCommentForm.value = false;
  } catch (error) {
    console.error('Error adding comment:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function cancelComment() {
  newComment.value = '';
  showCommentForm.value = false;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}
</script>
