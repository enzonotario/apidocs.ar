<script setup>
import { computed, onMounted, ref } from 'vue'

const divisasData = ref([])
const loading = ref(false)
const error = ref(null)
const filterText = ref('')

async function fetchDivisasData() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Maestros/Divisas')
    const data = await response.json()

    if (data.status === 200 && data.results) {
      divisasData.value = data.results
    } else {
      error.value = 'Error al cargar datos: Respuesta inválida'
    }
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

const filteredDivisasData = computed(() => {
  if (!filterText.value) return divisasData.value

  const searchTerm = filterText.value.toLowerCase()
  return divisasData.value.filter(item => 
    item.codigo.toLowerCase().includes(searchTerm) || 
    item.denominacion.toLowerCase().includes(searchTerm)
  )
})

onMounted(async () => {
  await fetchDivisasData()
})
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="fetchDivisasData" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Reintentar
      </button>
    </div>

    <div v-else>
      <h3>Divisas</h3>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Denominación</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="divisa in filteredDivisasData" :key="divisa.codigo">
            <td>{{ divisa.codigo }}</td>
            <td>{{ divisa.denominacion }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
