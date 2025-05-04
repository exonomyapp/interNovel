export default defineNuxtConfig({
  compatibilityDate: '2025-05-02', // Add this line to specify the compatibility date
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css', // Add Material Design Icons
    '@/assets/styles/main.scss',
  ],
  build: {
    transpile: ['vuetify'],
  },
  // other configurations...
});
