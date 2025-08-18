import { defineStore } from 'pinia';

interface Did {
  id: string;
  [key: string]: any;
}

interface DidState {
  dids: Record<string, Did>;
}

export const useDidStore = defineStore('did', {
  state: (): DidState => ({
    dids: {},
  }),
  actions: {
    createDid(did: string, data: Did) {
      this.dids[did] = data;
    },
    getDid(did: string): Did | undefined {
      return this.dids[did];
    },
  },
});