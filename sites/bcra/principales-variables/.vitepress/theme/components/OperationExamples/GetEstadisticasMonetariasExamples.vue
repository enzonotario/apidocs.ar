<script setup>
import {computed, onMounted, ref, watch} from 'vue'

const monetaryData = ref([])
const loading = ref(false)
const error = ref(null)

const categories = ref([])
const selectedCategory = ref('')
const selectedVariable = ref(null)
const filterText = ref('')

async function fetchMonetaryData() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias')
    const data = await response.json()

    if (data.status === 200 && data.results) {
      monetaryData.value = data.results

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

const filteredVariables = computed(() => {
  if (!selectedCategory.value) return []
  return monetaryData.value.filter(item => item.categoria === selectedCategory.value)
})

const uniqueVariables = computed(() => {
  const variableMap = new Map()

  filteredVariables.value.forEach(item => {
    if (!variableMap.has(item.idVariable)) {
      variableMap.set(item.idVariable, {
        id: item.idVariable,
        descripcion: item.descripcion
      })
    }
  })

  return Array.from(variableMap.values())
})

const allVariablesData = computed(() => {
  const variableMap = new Map()

  monetaryData.value.forEach(item => {
    if (!variableMap.has(item.idVariable)) {
      variableMap.set(item.idVariable, {
        id: item.idVariable,
        descripcion: item.descripcion,
        categoria: item.categoria,
        data: []
      })
    }

    variableMap.get(item.idVariable).data.push(item)
  })

  const result = []
  variableMap.forEach(variable => {
    variable.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    if (variable.data.length > 0) {
      result.push({
        ...variable.data[0],
        allData: variable.data
      })
    }
  })

  return result
})

const filteredAllVariablesData = computed(() => {
  if (!filterText.value) return allVariablesData.value

  const searchTerm = filterText.value.toLowerCase()
  return allVariablesData.value.filter(item => 
    item.descripcion.toLowerCase().includes(searchTerm)
  )
})

watch(selectedCategory, () => {
  selectedVariable.value = uniqueVariables.value.length > 0 ? uniqueVariables.value[0].id : null
})

onMounted(async () => {
  await fetchMonetaryData()
})
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="fetchMonetaryData" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Reintentar
      </button>
    </div>

    <div v-else>
      <h3>Variables monetarias</h3>

      <table>
        <thead>
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoría</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Variable</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Descripción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in filteredVariables" :key="item.idVariable">
            <td class="px-6 py-4 whitespace-nowrap">{{ item.categoria }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ item.idVariable }}</td>
            <td class="px-6 py-4 whitespace-nowrap max-w-86 text-wrap">{{ item.descripcion }}</td>
          </tr>
        </tbody>
      </table>

      <h3>Valores más recientes</h3>

      <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10">
        <div class="flex flex-col gap-2">
          <div class="flex items-center">
            <input
              v-model="filterText"
              type="text"
              placeholder="Filtrar por nombre de variable..."
              class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="text-sm text-muted-foreground">
            Mostrando {{ filteredAllVariablesData.length }} de {{ allVariablesData.length }} variables
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-[20px]">
        <div 
          v-for="(item, index) in filteredAllVariablesData" 
          :key="index" 
          class="p-2 flex flex-col gap-2 bg-muted rounded-lg overflow-hidden border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition duration-200"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground">{{ item.categoria }}</span>
            <span class="text-xs text-muted-foreground">ID: {{ item.idVariable }}</span>
          </div>

          <h3 class="font-medium text-lg line-clamp-3 !mt-2">{{ item.descripcion }}</h3>

          <span class="flex-1"></span>

          <span class="text-sm text-muted-foreground">Último valor ({{ new Date(item.fecha).toLocaleDateString('es-AR') }}):</span>
          <span class="text-2xl font-bold">{{ new Intl.NumberFormat('es-AR').format(item.valor) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
