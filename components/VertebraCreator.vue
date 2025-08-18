<template>
  <v-card>
    <v-card-title>Create a New Vertebra</v-card-title>
    <v-card-text>
      <v-text-field v-model="title" label="Title"></v-text-field>
      <v-textarea v-model="content" label="Content"></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="createVertebra">Create</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { useVertebraStore } from '~/stores/vertebrae'
import { useNovelStore } from '~/stores/novel'

const props = defineProps<{ novelId: string }>()

const title = ref('')
const content = ref('')

const vertebraStore = useVertebraStore()
const novelStore = useNovelStore()

const createVertebra = async () => {
  if (title.value && content.value) {
    const createdVertebra = await vertebraStore.createVertebra({
      title: title.value,
      content: content.value,
    })
    await novelStore.addVertebra(props.novelId, createdVertebra.id)
    title.value = ''
    content.value = ''
  }
}
</script>