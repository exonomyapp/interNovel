import { defineStore } from 'pinia';

export interface Novel {
  id: string;
  title: string;
  description: string;
  vertebrae: string[];
}

export interface NovelState {
  novels: { [key: string]: Novel };
}

export const useNovelStore = defineStore('novel', {
  state: (): NovelState => ({
    novels: {},
  }),
  actions: {
    async createNovel(novel: Omit<Novel, 'id'>): Promise<Novel> {
      const id = Math.random().toString(36).substr(2, 9);
      const newNovel = { ...novel, id };
      this.novels[id] = newNovel;
      return newNovel;
    },
    getNovel(id: string): Novel | undefined {
      return this.novels[id];
    },
    addVertebra(novelId: string, vertebraId: string) {
      if (this.novels[novelId]) {
        this.novels[novelId].vertebrae.push(vertebraId);
      }
    },
  },
});