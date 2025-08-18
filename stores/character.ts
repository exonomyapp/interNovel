import { defineStore } from 'pinia'

export interface Character {
  id: number
  name: string
  bio: string
  ownerId: number
  listed: boolean
  createdAt: string
}

export interface CharacterState {
  characters: { [key: number]: Character }
}

export const useCharacterStore = defineStore('character', {
  state: (): CharacterState => ({
    characters: {},
  }),
  actions: {
    async createCharacter(character: Omit<Character, 'id' | 'createdAt' | 'listed'>): Promise<Character> {
      const newCharacter = await $fetch<Character>('/api/characters', {
        method: 'POST',
        body: character,
      });
      this.characters[newCharacter.id] = newCharacter;
      return newCharacter;
    },
    async getCharacter(id: number): Promise<Character | null> {
      if (this.characters[id]) {
        return this.characters[id];
      }
      const character = await $fetch<Character>(`/api/characters/${id}`);
      if (character) {
        this.characters[character.id] = character;
        return character;
      }
      return null;
    },
  },
})