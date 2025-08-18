// Module augmentation for 'nuxt/schema':
// NuxtApp at runtime always has a 'vueApp' property (the underlying Vue 3 application instance),
// but the default Nuxt TypeScript types do not declare it. This mismatch forces 'as any' casting
// or @ts-ignore suppressions in plugin code.
// By extending the NuxtApp interface here, we make TypeScript aware of vueApp's existence,
// typed as Vue's App<Element>. This binds the static type model to the runtime reality.
// Place this file in 'types/nuxt.d.ts' and ensure tsconfig.json includes "types" or "include"
// pointing to this directory.

import '@nuxt/schema';

declare module 'nuxt/schema' {
  interface NuxtApp {
    vueApp: import('vue').App<Element>
  }
}