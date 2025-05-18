<script setup>
import { ref } from 'vue'
import { useOpenapi } from 'vitepress-openapi/client'

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const openapi = useOpenapi()

const filenames = openapi.getOperation('dump').parameters.find(p => p.name === 'filename').schema.enum.map((filename) => {
  return {
    value: filename,
    description: openapi.getOperation('dump').parameters.find(p => p.name === 'filename').description[filename]
  }
})

const selectedFilename = ref(filenames[0].value)

function downloadFile() {
  if (!selectedFilename.value) return
  window.open(`https://apis.datos.gob.ar/series/api/dump/${selectedFilename.value}`, '_blank')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-2 items-center">
      <label class="font-bold">Archivo</label>
      <select v-model="selectedFilename" class="w-full p-2 rounded">
        <option v-for="file in filenames" :key="file.value" :value="file.value">
          {{ file.value }}
        </option>
      </select>
    </div>
    
    <div v-if="selectedFilename" class="p-3 bg-muted rounded">
      <strong>URL:</strong> <code class="select-all break-all">https://apis.datos.gob.ar/series/api/dump/{{ selectedFilename }}</code>
    </div>
    
    <button
      @click="downloadFile"
      class="p-2 bg-primary text-primary-foreground rounded"
    >
      Descargar
    </button>
  </div>
</template>