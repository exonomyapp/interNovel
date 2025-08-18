<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>InterNovel</v-toolbar-title>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue';

const drawer = ref(false);
</script>