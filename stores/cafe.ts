import { defineStore } from 'pinia'
import type { Novel } from './novel'

export interface CafeState {
  showcasedNovels: { [key: string]: Novel }
}

export const useCafeStore = defineStore('cafe', {
  state: (): CafeState => ({
    showcasedNovels: {},
  }),
  actions: {
    addNovelToCafe(novel: Novel) {
      this.showcasedNovels[novel.id] = novel
    },
    removeNovelFromCafe(novelId: string) {
      delete this.showcasedNovels[novelId]
    },
  },
})