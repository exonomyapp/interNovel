<template>
  <v-container>
    <h1>Casting Studio</h1>
    <v-row>
      <v-col v-for="character in availableCharacters" :key="character.id" cols="12" md="4">
        <CharacterView :id="character.id" :show-list-button="true" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCastingStore } from '~/stores/casting';
import CharacterView from '~/components/CharacterView.vue';

const castingStore = useCastingStore();

onMounted(() => {
  castingStore.fetchAvailableCharacters();
});

const availableCharacters = computed(() => Object.values(castingStore.availableCharacters));
</script>