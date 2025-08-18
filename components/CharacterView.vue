<template>
  <v-card v-if="character">
    <v-card-title>{{ character.name }}</v-card-title>
    <v-card-text>{{ character.bio }}</v-card-text>
    <v-card-actions v-if="showListButton">
      <v-btn @click="toggleListed">
        {{ character.listed ? 'Unlist' : 'List' }} in Casting Studio
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useCharacterStore } from '~/stores/character';
import { useCastingStore } from '~/stores/casting';
import type { Character } from '~/stores/character';

const props = defineProps<{ id: number, showListButton?: boolean }>();

const characterStore = useCharacterStore();
const castingStore = useCastingStore();
const character = ref<Character | null>(null);

watchEffect(async () => {
  character.value = await characterStore.getCharacter(props.id);
});

async function toggleListed() {
  if (character.value) {
    await castingStore.setCharacterListed(character.value.id, !character.value.listed);
    // Refresh character state
    character.value = await characterStore.getCharacter(props.id);
  }
}
</script>