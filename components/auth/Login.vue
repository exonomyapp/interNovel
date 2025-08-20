<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h5">Login</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-btn type="submit" color="primary">Login with DID</v-btn>
            </v-form>
            <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
            <v-alert v-if="token" type="success" class="mt-4">Login successful!</v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDidAuth } from '~/composables/useDidAuth';
import { useDid } from '~/composables/useDid';

const { createChallenge, signChallenge, verifyChallenge } = useDidAuth();
const { publicKey, generateDid } = useDid();
const token = ref('');
const error = ref('');

const login = async () => {
  try {
    // In a real app, you would load the user's DID and keys.
    // For now, we generate a new one for demonstration purposes.
    await generateDid(); 

    const challenge = await createChallenge();
    const signature = await signChallenge();
    
    if (!publicKey.value || !challenge || !signature) {
      throw new Error('Could not get public key, challenge, or signature');
    }

    const isValid = await verifyChallenge(publicKey.value, challenge, signature);
    if (isValid) {
      token.value = 'true';
      // Store a session token or similar
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      error.value = 'Login failed: Invalid signature.';
    }
  } catch (err) {
    error.value = 'Login failed.';
    console.error(err);
  }
};
</script>