<template>
  <v-navigation-drawer v-model="drawer" app>
    <v-list-item>Home</v-list-item>
    <v-list-item to="/about" title="About"></v-list-item>
    <v-list-item to="/novels/create" title="Create Novel"></v-list-item>
        <v-list-item to="/casting" title="Casting Studio"></v-list-item>
        <v-list-item to="/cafe" title="Novel Café"></v-list-item>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue';

const drawer = ref(false);
</script>