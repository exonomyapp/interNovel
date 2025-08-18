<template>
  <div>
    <v-list>
      <v-list-item v-for="id in vertebraeIds" :key="id">
        <VertebraView :id="id" />
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">


defineProps<{ vertebraeIds: string[] }>()
</script>