<script setup>
import { ref, watch } from 'vue'
import { useOpenapi } from 'vitepress-openapi/client'

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const openapi = useOpenapi()

const loading = ref(true)
const error = ref(null)
const data = ref(null)

const searchQuery = ref('ipc')
const debouncedSearchQuery = ref('ipc')
const selectedSortBy = ref('hits_90_days')
const selectedSort = ref('desc')
const selectedLimit = ref(100)
const selectedTheme = ref('')
const selectedUnits = ref('')
const selectedSource = ref('')
const selectedPublisher = ref('')
const selectedCatalog = ref('')

const sortByOptions = openapi.getOperation('search').parameters.find(p => p.name === 'sort_by').schema.enum.map(sortBy => {
  const labels = {
    'relevance': 'Relevancia',
    'hits_90_days': 'Popularidad',
    'frequency': 'Frecuencia'
  }
  return {
    value: sortBy,
    label: labels[sortBy] || sortBy
  }
})

const sortOptions = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' }
]

const catalogOptions = [
  { value: '', label: 'Todos los catálogos' },
  ...openapi.getOperation('search').parameters.find(p => p.name === 'catalog_id').schema.enum.map(catalog => {
    return {
      value: catalog,
      label: catalog.charAt(0).toUpperCase() + catalog.slice(1)
    }
  })
]

let debounceTimeout = null
watch(searchQuery, (newValue) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)

  debounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newValue
  }, 300)
})

watch(
  [debouncedSearchQuery, selectedSortBy, selectedSort, selectedLimit, selectedTheme, selectedUnits, selectedSource, selectedPublisher, selectedCatalog],
  () => {
    fetchData()
  }
)

async function fetchData() {
  loading.value = true
  error.value = null

  try {
    let url = `https://apis.datos.gob.ar/series/api/search?format=json`

    if (debouncedSearchQuery.value) {
      url += `&q=${encodeURIComponent(debouncedSearchQuery.value)}`
    }

    url += `&sort_by=${selectedSortBy.value}&sort=${selectedSort.value}`

    url += `&limit=${selectedLimit.value}`

    if (selectedTheme.value) {
      url += `&dataset_theme=${encodeURIComponent(selectedTheme.value)}`
    }

    if (selectedUnits.value) {
      url += `&units=${encodeURIComponent(selectedUnits.value)}`
    }

    if (selectedSource.value) {
      url += `&dataset_source=${encodeURIComponent(selectedSource.value)}`
    }

    if (selectedPublisher.value) {
      url += `&dataset_publisher_name=${encodeURIComponent(selectedPublisher.value)}`
    }

    if (selectedCatalog.value) {
      url += `&catalog_id=${encodeURIComponent(selectedCatalog.value)}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status}`)
    }
    data.value = await response.json()
    loading.value = false
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}

fetchData()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-4 p-4 border rounded">
      <h3 class="!mt-0">Filtros de búsqueda</h3>

      <div class="flex flex-col gap-2">
        <label class="font-bold">Búsqueda</label>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Ingrese términos de búsqueda" 
          class="w-full p-2 bg-muted rounded"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="flex flex-col gap-2">
          <label class="font-bold">Ordenar por</label>
          <select v-model="selectedSortBy" class="w-full p-2 bg-muted rounded">
            <option v-for="option in sortByOptions" :key="option.value" :value="option.value">
              {{ option.label }} ({{ option.value }})
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold">Dirección</label>
          <select v-model="selectedSort" class="w-full p-2 bg-muted rounded">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold">Límite de resultados</label>
          <select v-model="selectedLimit" class="w-full p-2 bg-muted rounded">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold">Temática</label>
          <input 
            v-model="selectedTheme" 
            type="text" 
            placeholder="Filtrar por temática" 
            class="w-full p-2 bg-muted rounded"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold">Unidades</label>
          <input 
            v-model="selectedUnits" 
            type="text" 
            placeholder="Filtrar por unidades" 
            class="w-full p-2 bg-muted rounded"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold">Fuente</label>
          <input 
            v-model="selectedSource" 
            type="text" 
            placeholder="Filtrar por fuente" 
            class="w-full p-2 bg-muted rounded"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold">Publicador</label>
          <input 
            v-model="selectedPublisher" 
            type="text" 
            placeholder="Filtrar por publicador" 
            class="w-full p-2 bg-muted rounded"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold">Catálogo</label>
          <select v-model="selectedCatalog" class="w-full p-2 bg-muted rounded">
            <option v-for="option in catalogOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-4">
      Cargando datos...
    </div>

    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>

    <div v-else>
      <h3>Resultados de búsqueda</h3>

      <p>Total de resultados: {{ data.count }}</p>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Frecuencia</th>
            <th>Unidad</th>
            <th>Fecha de inicio</th>
            <th>Fecha de fin</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data.data" :key="index">
            <td>{{ item.field.id }}</td>
            <td>{{ item.field.title }}</td>
            <td>{{ item.field.description }}</td>
            <td>{{ item.field.frequency }}</td>
            <td>{{ item.field.units }}</td>
            <td>{{ item.field.time_index_start }}</td>
            <td>{{ item.field.time_index_end }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
