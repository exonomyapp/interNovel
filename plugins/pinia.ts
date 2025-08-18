// Pinia plugin registration for Nuxt.
// This plugin integrates Pinia with the Nuxt application lifecycle.
// Historically, @ts-ignore was used here to bypass three mismatches:
//   1) defineNuxtPlugin auto-imports (not recognized by TS without config).
//   2) NuxtApp type imports from internal '@nuxt/schema' (fragile).
//   3) nuxtApp.vueApp runtime property (not declared in TS by default).
//
// We now rely on Nuxt's global auto-import typings (no import needed),
// and we extend NuxtApp via module augmentation in 'types/nuxt.d.ts'
// to declare vueApp properly. This removes the need for suppressions
// and aligns static typing with Nuxt's runtime guarantees.
import { defineNuxtPlugin } from '#app'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia()
  // piniaPluginPersistedstate – plugin registration
  //
  // We attach the persisted state plugin to the Pinia instance before it is
  // provided to the Nuxt app. This ensures that all stores automatically
  // persist their state (e.g., in localStorage) across page reloads or
  // app restarts. Registering it here, prior to `nuxtApp.vueApp.use(pinia)`,
  // guarantees that the Vue application and all components have access to
  // fully-initialized stores with persistence enabled.
  pinia.use(piniaPluginPersistedstate)
  nuxtApp.vueApp.use(pinia)
})