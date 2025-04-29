<script setup>
import { ref } from 'vue'

const filenames = [
  "provincias.csv", "provincias.json", "provincias.geojson", "provincias.ndjson",
  "departamentos.csv", "departamentos.json", "departamentos.geojson", "departamentos.ndjson",
  "municipios.csv", "municipios.json", "municipios.geojson", "municipios.ndjson",
  "localidades.csv", "localidades.json", "localidades.geojson", "localidades.ndjson",
  "localidades_censales.csv", "localidades_censales.json", "localidades_censales.geojson", "localidades_censales.ndjson",
  "asentamientos.csv", "asentamientos.json", "asentamientos.geojson", "asentamientos.ndjson",
  "calles.csv", "calles.json", "calles.geojson", "calles.ndjson",
  "cuadras.csv", "cuadras.json", "cuadras.geojson", "cuadras.ndjson"
]
const selectedFilename = ref(filenames[0])

function downloadFile() {
  if (!selectedFilename.value) return
  window.open(`https://apis.datos.gob.ar/georef/api/${selectedFilename.value}`, '_blank')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-2 items-center">
      <label class="font-bold">archivo</label>
      <select v-model="selectedFilename" class="w-full p-2 rounded">
        <option v-for="file in filenames" :key="file" :value="file">{{ file }}</option>
      </select>
    </div>
    <button
        @click="downloadFile"
        class="p-2 bg-primary text-primary-foreground rounded"
    >
      Descargar
    </button>
  </div>
</template>
