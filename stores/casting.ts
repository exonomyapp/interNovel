import { defineStore } from 'pinia';
import type { Character } from './character';

export interface CastingState {
  availableCharacters: { [key: number]: Character };
}

export const useCastingStore = defineStore('casting', {
  state: (): CastingState => ({
    availableCharacters: {},
  }),
  actions: {
    async fetchAvailableCharacters() {
      const characters = await $fetch<Character[]>('/api/casting-studio');
      this.availableCharacters = characters.reduce((acc, character) => {
        acc[character.id] = character;
        return acc;
      }, {} as { [key: number]: Character });
    },
    async setCharacterListed(characterId: number, listed: boolean) {
      await $fetch(`/api/casting-studio/${characterId}`,
        {
          method: 'PATCH',
          body: { listed },
        });
      if (listed) {
        const character = await $fetch<Character>(`/api/characters/${characterId}`);
        this.availableCharacters[characterId] = character;
      } else {
        delete this.availableCharacters[characterId];
      }
    },
  },
});