import { defineStore } from 'pinia';

export interface Vertebra {
  id: string;
  title: string;
  content: string;
}

export interface VertebraState {
  vertebrae: { [key: string]: Vertebra };
}

export const useVertebraStore = defineStore('vertebra', {
  state: (): VertebraState => ({
    vertebrae: {},
  }),
  actions: {
    async createVertebra(vertebra: Omit<Vertebra, 'id'>): Promise<Vertebra> {
      const id = Math.random().toString(36).substr(2, 9);
      const newVertebra = { ...vertebra, id };
      this.vertebrae[id] = newVertebra;
      return newVertebra;
    },
    getVertebra(id: string): Vertebra | undefined {
      return this.vertebrae[id];
    },
  },
});