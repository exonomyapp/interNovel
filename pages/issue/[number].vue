<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-btn
                icon="mdi-arrow-left"
                variant="text"
                @click="router.back()"
              ></v-btn>
              <span class="text-h5 ml-2">Issue #{{ issue?.number }}</span>
            </div>
            
            <IssueDetail v-if="issue" :issue="issue" />
            
            <v-alert v-else-if="error" type="error" class="mt-4">
              {{ error }}
            </v-alert>
            
            <v-progress-circular
              v-else
              indeterminate
              color="primary"
              class="ma-4"
            ></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="issue">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <span class="text-h6">Comments</span>
            <!-- Comments section using Vuetify components -->
            <div class="mt-6">
              <h3 class="text-h6 mb-3">Comments</h3>
              
              <!-- Error alert for comments -->
              <v-alert v-if="commentError" type="error" title="Comment Error" :text="commentError.message" class="mb-4" closable></v-alert>
              
              <!-- Form to add a new comment -->
              <v-textarea
                v-model="newCommentContent"
                label="Add a comment"
                variant="outlined"
                rows="3"
                class="mb-2"
                hide-details
                :disabled="isSavingComment"
              ></v-textarea>
              
              <div class="d-flex">
                <v-spacer></v-spacer>
                <v-btn 
                  color="primary" 
                  class="mt-2" 
                  @click="addComment" 
                  :loading="isSavingComment" 
                  :disabled="isSavingComment || !newCommentContent.trim()"
                >
                  Add Comment
                </v-btn>
              </div>
              
              <!-- Comments List -->
              <div v-if="comments && comments.length > 0" class="mt-4">
                <v-card 
                  v-for="comment in comments" 
                  :key="comment.id"
                  class="mb-4"
                  variant="outlined"
                >
                  <v-card-item>
                    <template v-slot:prepend>
                      <v-avatar color="grey-lighten-1">
                        <v-icon>mdi-account</v-icon>
                      </v-avatar>
                    </template>
                    
                    <v-card-title>
                      <div class="d-flex justify-space-between align-center">
                        <span>{{ comment.author }}</span>
                        <span class="text-caption">{{ formatDate(comment.createdAt) }}</span>
                      </div>
                    </v-card-title>
                  </v-card-item>
                  
                  <v-divider></v-divider>
                  
                  <v-card-text>
                    <!-- Edit mode -->
                    <div v-if="editingCommentId === comment.id" class="comment-edit-form">
                      <v-textarea
                        v-model="editedCommentContent"
                        variant="outlined"
                        rows="3"
                        auto-grow
                        hide-details
                        :disabled="isSavingComment"
                        class="mb-2"
                      ></v-textarea>
                      
                      <div class="d-flex">
                        <v-spacer></v-spacer>
                        <v-btn
                          variant="text"
                          color="error"
                          size="small"
                          class="mr-2"
                          @click="cancelEditingComment"
                          :disabled="isSavingComment"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          variant="text"
                          color="success"
                          size="small"
                          @click="updateComment(comment.id)"
                          :loading="isSavingComment"
                          :disabled="isSavingComment || !editedCommentContent.trim()"
                        >
                          Save
                        </v-btn>
                      </div>
                    </div>
                    
                    <!-- View mode -->
                    <div v-else class="comment-body">
                      <div class="text-body-1 mb-4" style="white-space: pre-wrap; word-wrap: break-word;">{{ comment.body }}</div>
                      
                      <div class="d-flex">
                        <v-spacer></v-spacer>
                        <v-btn
                          variant="text"
                          color="primary"
                          size="small"
                          class="mr-2"
                          prepend-icon="mdi-pencil"
                          @click="startEditingComment(comment)"
                        >
                          Edit
                        </v-btn>
                        <v-btn
                          variant="text"
                          color="error"
                          size="small"
                          prepend-icon="mdi-delete"
                          @click="deleteComment(comment.id)"
                        >
                          Delete
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
              
              <!-- No comments message -->
              <v-alert v-else-if="!pending" type="info" class="mt-4">
                No comments yet. Be the first to comment on this issue.
              </v-alert>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Issue, Comment } from '../../types/index';
import { useEventBus, EVENTS } from '../../composables/useEventBus';
import { marked } from 'marked';

// Get route and issue number
const route = useRoute();
const issueNumber = computed(() => Number(route.params.number));

// Fetch the issue data
const { data: issue, pending, error, refresh: refreshIssueData } = await useFetch<Issue>(`/api?type=issues&issueNumber=${issueNumber.value}`, {
  key: `issue-${issueNumber.value}`,
  default: () => null
});

// Fetch comments for this issue
const { data: comments, refresh: refreshComments } = await useFetch<Comment[]>(`/api?type=comments&issueNumber=${issueNumber.value}`, {
  key: `comments-${issueNumber.value}`,
  default: () => []
});

// Edit mode state
const isEditingDescription = ref(false);
const editedDescription = ref('');
const isSaving = ref(false);
const saveError = ref<Error | null>(null);
const activeTab = ref(0); // 0 = Edit, 1 = Preview

// Computed property to render markdown
const renderedMarkdown = computed(() => {
  if (!editedDescription.value) return '';
  return marked(editedDescription.value);
});

// Start editing the description
const startEditing = () => {
  editedDescription.value = issue.value?.body || '';
  isEditingDescription.value = true;
  saveError.value = null;
};

// Cancel editing and reset
const cancelEditing = () => {
  isEditingDescription.value = false;
  editedDescription.value = '';
  saveError.value = null;
};

// Save the edited description
const saveDescription = async () => {
  if (!issue.value) return;
  
  isSaving.value = true;
  saveError.value = null;
  
  try {
    // Call the API to update the issue
    const response = await fetch('/api', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: issue.value.number,
        body: editedDescription.value,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update issue description');
    }
    
    // Update the local issue data with the response
    const updatedIssue = await response.json();
    issue.value = updatedIssue;
    
    // Exit edit mode
    isEditingDescription.value = false;
    
    // Emit event to refresh the tree view
    const { emit } = useEventBus();
    emit(EVENTS.REFRESH_TREE);
    console.log('Emitted tree refresh event after saving issue description');
    
  } catch (err) {
    console.error('Error saving description:', err);
    saveError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSaving.value = false;
  }
};

// Refresh issue data
const refreshIssue = () => {
  refreshIssueData();
};

// Format date consistently for both client and server
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // Use a fixed format that doesn't depend on locale or timezone
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  
  return `${month}/${day}/${year}`;
};

// Comment state
const newCommentContent = ref('');
const isAddingComment = ref(false);
const editingCommentId = ref<number | null>(null);
const editedCommentContent = ref('');
const commentError = ref<Error | null>(null);
const isSavingComment = ref(false);

// Comment functions
const addComment = async () => {
  if (!newCommentContent.value.trim()) return;
  
  isSavingComment.value = true;
  commentError.value = null;
  
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'comment',
        issueNumber: issueNumber.value,
        content: newCommentContent.value,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add comment');
    }
    
    // Clear the form and refresh comments
    newCommentContent.value = '';
    await refreshComments();
    
  } catch (err) {
    console.error('Error adding comment:', err);
    commentError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSavingComment.value = false;
  }
};

const startEditingComment = (comment: Comment) => {
  editingCommentId.value = comment.id;
  editedCommentContent.value = comment.body;
  commentError.value = null;
};

const cancelEditingComment = () => {
  editingCommentId.value = null;
  editedCommentContent.value = '';
  commentError.value = null;
};

const updateComment = async (commentId: number) => {
  if (!editedCommentContent.value.trim()) return;
  
  isSavingComment.value = true;
  commentError.value = null;
  
  try {
    const response = await fetch('/api', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'comment',
        commentId: commentId,
        content: editedCommentContent.value,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update comment');
    }
    
    // Reset editing state and refresh comments
    editingCommentId.value = null;
    editedCommentContent.value = '';
    await refreshComments();
    
  } catch (err) {
    console.error('Error updating comment:', err);
    commentError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSavingComment.value = false;
  }
};

const deleteComment = async (commentId: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) return;
  
  isSavingComment.value = true;
  commentError.value = null;
  
  try {
    const response = await fetch('/api', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'comment',
        commentId: commentId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete comment');
    }
    
    // Refresh comments
    await refreshComments();
    
  } catch (err) {
    console.error('Error deleting comment:', err);
    commentError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isSavingComment.value = false;
  }
};
</script>