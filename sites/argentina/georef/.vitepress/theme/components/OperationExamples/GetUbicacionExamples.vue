<script setup>
import { ref } from 'vue'
import { Chart as ChartJS, Legend, LinearScale, PointElement, Title, Tooltip } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale)

const lat = ref(-32.8551545)
const lon = ref(-60.697636)
const ubicacion = ref(null)
const parametros = ref(null)

async function fetchUbicacion() {
  const url = `https://apis.datos.gob.ar/georef/api/ubicacion?lat=${lat.value}&lon=${lon.value}&aplanar=true&campos=completo&formato=json`
  const data = await (await fetch(url)).json()
  ubicacion.value = data.ubicacion
  parametros.value = data.parametros
}

fetchUbicacion()
</script>

<template>
  <div class="p-4">
    <div class="flex flex-row items-center gap-2 mb-4">
      <label>
        Lat:
        <input v-model.number="lat" type="number" step="0.000001" class="p-2 bg-muted w-36" />
      </label>
      <label>
        Lon:
        <input v-model.number="lon" type="number" step="0.000001" class="p-2 bg-muted w-36" />
      </label>
      <button @click="fetchUbicacion" class="p-2 bg-primary text-primary-foreground rounded">
        Buscar
      </button>
    </div>
    <div v-if="ubicacion">
      <h3>Ubicación</h3>
      <table>
        <tr><th class="text-left">Provincia</th><td>{{ ubicacion.provincia_nombre }}</td></tr>
        <tr><th class="text-left">Provincia Fuente</th><td>{{ ubicacion.provincia_fuente }}</td></tr>
        <tr><th class="text-left">Provincia ID</th><td>{{ ubicacion.provincia_id }}</td></tr>
        <tr><th class="text-left">Departamento</th><td>{{ ubicacion.departamento_nombre }}</td></tr>
        <tr><th class="text-left">Departamento Fuente</th><td>{{ ubicacion.departamento_fuente }}</td></tr>
        <tr><th class="text-left">Departamento ID</th><td>{{ ubicacion.departamento_id }}</td></tr>
        <tr><th class="text-left">Municipio</th><td>{{ ubicacion.municipio_nombre }}</td></tr>
        <tr><th class="text-left">Municipio Fuente</th><td>{{ ubicacion.municipio_fuente }}</td></tr>
        <tr><th class="text-left">Municipio ID</th><td>{{ ubicacion.municipio_id }}</td></tr>
        <tr><th class="text-left">Lat</th><td>{{ ubicacion.lat }}</td></tr>
        <tr><th class="text-left">Lon</th><td>{{ ubicacion.lon }}</td></tr>
      </table>
    </div>
    <div v-else>
      No hay datos para la ubicación actual.
    </div>
  </div>
</template>
