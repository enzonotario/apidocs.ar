<script setup>
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'

const cotizacionesData = ref({})
const loading = ref(false)
const error = ref(null)
const filterText = ref('')

async function fetchCotizacionesData() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones')
    const data = await response.json()

    if (data.status === 200 && data.results) {
      cotizacionesData.value = data.results
    } else {
      error.value = 'Error al cargar datos: Respuesta inválida'
    }
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

const filteredCotizacionesData = computed(() => {
  if (!cotizacionesData.value.detalle) return []

  if (!filterText.value) return cotizacionesData.value.detalle

  const searchTerm = filterText.value.toLowerCase()
  return cotizacionesData.value.detalle.filter(item => 
    item.codigoMoneda.toLowerCase().includes(searchTerm) || 
    item.descripcion.toLowerCase().includes(searchTerm)
  )
})

onMounted(async () => {
  await fetchCotizacionesData()
})
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="fetchCotizacionesData" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Reintentar
      </button>
    </div>

    <div v-else-if="cotizacionesData.fecha">
      <h3>Cotizaciones - {{ format(new Date(cotizacionesData.fecha), 'dd/MM/yyyy') }}</h3>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Tipo de Pase</th>
            <th>Tipo de Cotización</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredCotizacionesData" :key="item.codigoMoneda">
            <td>{{ item.codigoMoneda }}</td>
            <td>{{ item.descripcion }}</td>
            <td>{{ item.tipoPase.toFixed(6) }}</td>
            <td>{{ item.tipoCotizacion > 0 ? item.tipoCotizacion : 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
