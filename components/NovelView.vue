<template>
  <div>
    <v-card v-if="novel">
      <v-card-title>{{ novel.title }}</v-card-title>
      <v-card-text>{{ novel.description }}</v-card-text>
      <v-divider></v-divider>
      <VertebraeView :vertebrae-ids="novel.vertebrae" />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useNovelStore } from '~/stores/novel'

import type { Novel } from '~/stores/novel'

const props = defineProps<{ id: string }>()

const novelStore = useNovelStore()
const novel = ref<Novel | undefined>(undefined)

watchEffect(() => {
  novel.value = novelStore.getNovel(props.id)
})
</script>