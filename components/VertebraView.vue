<template>
  <v-card v-if="vertebra">
    <v-card-title>{{ vertebra.title }}</v-card-title>
    <v-card-text>{{ vertebra.content }}</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useVertebraStore } from '~/stores/vertebrae'
import type { Vertebra } from '~/stores/vertebrae'

const props = defineProps<{ id: string }>()

const vertebraStore = useVertebraStore()
const vertebra = ref<Vertebra | undefined>(undefined)

watchEffect(() => {
  vertebra.value = vertebraStore.getVertebra(props.id)
})
</script>