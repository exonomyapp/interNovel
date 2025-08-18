<template>
  <v-container>
    <h1>Novel Café</h1>
    <v-row>
      <v-col v-for="novel in showcasedNovels" :key="novel.id" cols="12" md="4">
        <NovelView :id="novel.id" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCafeStore } from '~/stores/cafe'
import NovelView from '~/components/NovelView.vue'

const cafeStore = useCafeStore()

const showcasedNovels = computed(() => Object.values(cafeStore.showcasedNovels))
</script>