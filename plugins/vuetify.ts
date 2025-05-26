import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
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
  })

  app.vueApp.use(vuetify)
}) 