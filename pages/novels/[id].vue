<template>
  <div>
    <NovelView :id="$route.params.id as string" />
    <VertebraCreator :novel-id="$route.params.id as string" />
    <CharacterCreator :novel-id="$route.params.id as string" />
  </div>
</template>

<script setup lang="ts">
import NovelView from '~/components/NovelView.vue'
import VertebraCreator from '~/components/VertebraCreator.vue'
import CharacterCreator from '~/components/CharacterCreator.vue'
</script>