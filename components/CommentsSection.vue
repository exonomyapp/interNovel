<template>
  <v-card-text class="comments-container">
    <div class="comments-header">
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
    </div>

    <!-- Comments list -->
    <div class="comments-list-container">
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
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Octokit } from '@octokit/rest';
import type { Issue, Comment } from '../types';

const props = defineProps<{
  issue?: Issue,
  repository?: {
    full_name: string;
  }
}>();

const comments = ref<Comment[]>([]);
const newComment = ref('');
const isLoading = ref(false);
const isSubmitting = ref(false);
const showCommentForm = ref(false);
const octokit = ref<Octokit | null>(null);

// Initialize Octokit when component is mounted
onMounted(() => {
  const token = localStorage.getItem('github_access_token');
  if (token) {
    octokit.value = new Octokit({ auth: token });
  }
});

// Load comments when issue changes
watch(() => props.issue?.number, async (newNumber) => {
  if (!newNumber || !props.repository?.full_name || !octokit.value) {
    comments.value = [];
    return;
  }
  await fetchComments(newNumber);
});

async function fetchComments(issueNumber: number) {
  if (!octokit.value || !props.repository?.full_name) return;
  
  isLoading.value = true;
  try {
    const [owner, repo] = props.repository.full_name.split('/');
    const response = await octokit.value.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
    });
    comments.value = response.data.map(comment => ({
      id: comment.id,
      issueNumber: issueNumber,
      author: comment.user?.login || 'Unknown',
      body: comment.body || '',
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      reactions: comment.reactions ? {
        '+1': comment.reactions['+1'],
        '-1': comment.reactions['-1'],
        laugh: comment.reactions.laugh,
        confused: comment.reactions.confused,
        heart: comment.reactions.heart,
        hooray: comment.reactions.hooray,
        eyes: comment.reactions.eyes,
        rocket: comment.reactions.rocket
      } : undefined,
      isEdited: false // GitHub API doesn't provide this information directly
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    comments.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function submitComment() {
  if (!props.issue?.number || !newComment.value.trim() || !octokit.value || !props.repository?.full_name) return;
  
  isSubmitting.value = true;
  try {
    const [owner, repo] = props.repository.full_name.split('/');
    const response = await octokit.value.issues.createComment({
      owner,
      repo,
      issue_number: props.issue.number,
      body: newComment.value
    });
    
    const newCommentData = response.data;
    comments.value.push({
      id: newCommentData.id,
      issueNumber: props.issue.number,
      author: newCommentData.user?.login || 'Unknown',
      body: newCommentData.body || '',
      createdAt: newCommentData.created_at,
      updatedAt: newCommentData.updated_at,
      reactions: newCommentData.reactions ? {
        '+1': newCommentData.reactions['+1'],
        '-1': newCommentData.reactions['-1'],
        laugh: newCommentData.reactions.laugh,
        confused: newCommentData.reactions.confused,
        heart: newCommentData.reactions.heart,
        hooray: newCommentData.reactions.hooray,
        eyes: newCommentData.reactions.eyes,
        rocket: newCommentData.reactions.rocket
      } : undefined,
      isEdited: false
    });
    
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

<style scoped>
.comments-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 !important;
}

.comments-header {
  padding: 16px;
  border-bottom: 1px solid var(--gh-border-default);
}

.comments-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.v-card) {
  background-color: var(--gh-bg-default) !important;
  border: 1px solid var(--gh-border-default) !important;
}

:deep(.v-card-text) {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
