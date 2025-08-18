<template>
  <v-card>
    <v-card-title>Create a New Character</v-card-title>
    <v-card-text>
      <v-text-field v-model="name" label="Name"></v-text-field>
      <v-textarea v-model="bio" label="Bio"></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="createCharacter">Create</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCharacterStore } from '~/stores/character';

const name = ref('');
const bio = ref('');

const characterStore = useCharacterStore();

const createCharacter = async () => {
  if (name.value && bio.value) {
    await characterStore.createCharacter({
      name: name.value,
      bio: bio.value,
      ownerId: 1, // TODO: Replace with actual user ID
    });
    name.value = '';
    bio.value = '';
  }
};
</script>