<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Welcome to Internovel!</v-card-title>
          <v-card-text>
            <div v-if="!authStore.isLoggedIn">
              <p>Please sign in to access all features</p>
            </div>
            <div v-if="authStore.isLoggedIn">
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-avatar
                    color="primary"
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ authStore.user?.email?.charAt(0).toUpperCase() }}
                  </v-avatar>
                </template>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>{{ authStore.user?.email }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>DID: {{ did }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <div v-else>
              <v-select
                v-model="selectedDid"
                :items="availableDids"
                label="Select DID"
                outlined
                class="mb-4"
              ></v-select>
              <v-btn color="primary" to="/auth">Login / Register</v-btn>
            </div>
            <div v-if="authStore.isLoggedIn">
              <!-- Authenticated-only features will go here -->
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useDid } from '~/composables/useDid'

const authStore = useAuthStore()
const { did, generateDid } = useDid()
const selectedDid = ref('')
const availableDids = ref(['did:example:123', 'did:example:456']) // Replace with actual DID fetching logic

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await generateDid()
  }
})
</script>

<style scoped>
/* You can add component-specific styles here */
</style>