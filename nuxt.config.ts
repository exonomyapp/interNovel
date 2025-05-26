// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      githubClientId: 'Ov23liMrCpSFajxWzoYp',
      baseUrl: 'http://localhost:3000'
    }
  },
  nitro: {
    routeRules: {
      '/api/auth/**': { cors: true }
    }
  },
  experimental: {
    payloadExtraction: false
  },
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css'
  ],
  build: {
    transpile: ['vuetify']
  },
  vite: {
    build: {
      target: 'esnext'
    },
    define: {
      'process.env.DEBUG': false,
    },
  }
})
