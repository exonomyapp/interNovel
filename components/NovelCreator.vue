<template>
  <v-card>
    <v-card-title>Create a New Novel</v-card-title>
    <v-card-text>
      <v-text-field v-model="title" label="Title"></v-text-field>
      <v-textarea v-model="description" label="Description"></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="createNovel">Create</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNovelStore } from '~/stores/novel'

const title = ref('')
const description = ref('')

const novelStore = useNovelStore()

const createNovel = async () => {
  if (title.value && description.value) {
    await novelStore.createNovel({
      title: title.value,
      description: description.value,
      vertebrae: [],
    })
    title.value = ''
    description.value = ''
  }
}
</script>