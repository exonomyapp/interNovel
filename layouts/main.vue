<template>
  <v-app>
    <v-layout>
      <NavigationDrawer />
      <AppBar />
      <v-main>
        <v-container fluid>
          <slot />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import NavigationDrawer from '~/components/NavigationDrawer.vue';
import AppBar from '~/components/AppBar.vue';
</script>