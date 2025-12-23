<script setup>
import { computed, onMounted, ref } from 'vue'

const monetariasData = ref([])
const loading = ref(false)
const error = ref(null)
const filterText = ref('')
const selectedCategory = ref('')
const categories = ref([])

async function fetchMonetariasData() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias?Limit=250&Offset=0')
    const data = await response.json()

    if (data.status === 200 && data.results) {
      monetariasData.value = data.results

      const uniqueCategories = [...new Set(data.results.map(item => item.categoria))]
      categories.value = uniqueCategories

      if (uniqueCategories.length > 0) {
        selectedCategory.value = uniqueCategories[0]
      }
    } else {
      error.value = 'Error al cargar datos: Respuesta inválida'
    }
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

const filteredMonetariasData = computed(() => {
  let filtered = monetariasData.value

  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.categoria === selectedCategory.value)
  }

  if (filterText.value) {
    const searchTerm = filterText.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.descripcion.toLowerCase().includes(searchTerm) ||
      item.idVariable.toString().includes(searchTerm)
    )
  }

  return filtered
})

onMounted(async () => {
  await fetchMonetariasData()
})
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="fetchMonetariasData" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Reintentar
      </button>
    </div>

    <div v-else>
      <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 font-medium text-sm">Categoría</label>
            <select
              v-model="selectedCategory"
              class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-2 font-medium text-sm">Buscar</label>
            <input
              v-model="filterText"
              type="text"
              placeholder="Filtrar por descripción o ID..."
              class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <h3>Variables Monetarias</h3>

      <table>
        <thead>
          <tr>
            <th>ID Variable</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Tipo Serie</th>
            <th>Periodicidad</th>
            <th>Último Valor</th>
            <th>Última Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredMonetariasData" :key="item.idVariable">
            <td>{{ item.idVariable }}</td>
            <td class="max-w-xs">{{ item.descripcion }}</td>
            <td>{{ item.categoria }}</td>
            <td>{{ item.tipoSerie }}</td>
            <td>{{ item.periodicidad }}</td>
            <td>{{ new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(item.ultValorInformado) }}</td>
            <td>{{ new Date(item.ultFechaInformada).toLocaleDateString('es-AR') }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredMonetariasData.length === 0" class="text-center py-8 text-muted-foreground">
        No se encontraron resultados
      </div>
    </div>
  </div>
</template>

