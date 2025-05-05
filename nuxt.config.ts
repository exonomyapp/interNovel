import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-02',
  css: [
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  modules: ['vuetify-nuxt-module'],
  vuetify: {
    moduleOptions: {
      importComposables: true,
      styles: true
    },
    vuetifyOptions: {
      defaults: {
        VCard: { variant: 'outlined', density: 'comfortable' },
        VBtn: { variant: 'tonal' },
        VTextField: { variant: 'outlined' }
      },
      display: {
        mobileBreakpoint: 'sm'
      },
      theme: {
        defaultTheme: 'dark',
        themes: {
          light: {
            colors: {
              primary: '#1DA1F2',
              secondary: '#657786',
              accent: '#17BF63',
              error: '#E0245E',
              warning: '#FFAD1F',
              success: '#17BF63',
              info: '#1DA1F2',
              surface: '#FFFFFF',
              background: '#F7F9FA'
            }
          },
          dark: {
            colors: {
              primary: '#1DA1F2',
              secondary: '#8899A6',
              accent: '#17BF63',
              error: '#E0245E',
              warning: '#FFAD1F',
              success: '#17BF63',
              info: '#1DA1F2',
              surface: '#15202B',
              background: '#192734'
            }
          }
        }
      }
    }
  }
});
