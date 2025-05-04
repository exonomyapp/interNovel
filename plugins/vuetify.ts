// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import { md3 } from 'vuetify/blueprints'

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    components,
    directives,
    blueprint: md3,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#1DA1F2', // X.com blue
            secondary: '#657786', // X.com gray
            accent: '#17BF63', // X.com green
            error: '#E0245E', // X.com red
            warning: '#FFAD1F', // X.com orange
            success: '#17BF63', // X.com green
            info: '#1DA1F2', // X.com blue
            surface: '#FFFFFF',
            background: '#F7F9FA',
          }
        },
        dark: {
          dark: true,
          colors: {
            primary: '#1DA1F2', // X.com blue
            secondary: '#8899A6', // X.com light gray
            accent: '#17BF63', // X.com green
            error: '#E0245E', // X.com red
            warning: '#FFAD1F', // X.com orange
            success: '#17BF63', // X.com green
            info: '#1DA1F2', // X.com blue
            surface: '#15202B', // X.com dark blue
            background: '#192734', // X.com darker blue
          }
        }
      }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})