<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h5">Register</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="register">
              <v-btn type="submit" color="primary">Register with DID</v-btn>
            </v-form>
            <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
            <v-alert v-if="user" type="success" class="mt-4">Welcome, {{ user.did }}</v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDid } from '~/composables/useDid';

// Define a type for the user for better type-safety
interface User {
  did: string;
}

const { generateDid } = useDid();
const user = ref<User | null>(null);
const error = ref('');

const register = async () => {
  try {
    const newDid = await generateDid();
    if (newDid) {
        user.value = { did: newDid };
    } else {
        throw new Error('DID generation failed');
    }
    // In a real application, you would send the public key or DID to your server
    // to associate it with a user account.
  } catch (err) {
    error.value = 'Registration failed';
    console.error(err);
  }
};
</script>