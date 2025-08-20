// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import * as dotenv from 'dotenv'
dotenv.config()

export default defineNuxtConfig({
  devtools: {
    enabled: true
  },
  modules: [
    '@nuxtjs/supabase',
    'vuetify-nuxt-module',
    '@pinia/nuxt',
  ],

  runtimeConfig: {
    public: {
      debug: false,
    },
  },
  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  css: [],

  nitro: {
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
  },
})