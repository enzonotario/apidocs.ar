<script setup>
import { computed, onMounted, ref } from 'vue'

const metodologiaData = ref([])
const loading = ref(false)
const error = ref(null)
const filterText = ref('')

async function fetchMetodologiaData() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://api.bcra.gob.ar/estadisticas/v4.0/Metodologia?Limit=250&Offset=0')
    const data = await response.json()

    if (data.status === 200 && data.results) {
      metodologiaData.value = data.results
    } else {
      error.value = 'Error al cargar datos: Respuesta inválida'
    }
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

const filteredMetodologiaData = computed(() => {
  if (!filterText.value) return metodologiaData.value

  const searchTerm = filterText.value.toLowerCase()
  return metodologiaData.value.filter(item => 
    item.detalle.toLowerCase().includes(searchTerm)
  )
})

onMounted(async () => {
  await fetchMetodologiaData()
})
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="fetchMetodologiaData" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Reintentar
      </button>
    </div>

    <div v-else>
      <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10 mb-4">
        <input
          v-model="filterText"
          type="text"
          placeholder="Filtrar por detalle..."
          class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <h3>Metodología</h3>

      <div class="space-y-4">
        <div 
          v-for="item in filteredMetodologiaData" 
          :key="item.id" 
          class="p-4 bg-muted rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition duration-200"
        >
          <div class="flex items-start justify-between gap-4">
            <span class="text-xs text-muted-foreground font-medium">ID: {{ item.id }}</span>
          </div>
          <p class="mt-2 text-sm">{{ item.detalle }}</p>
        </div>
      </div>

      <div v-if="filteredMetodologiaData.length === 0 && filterText" class="text-center py-8 text-muted-foreground">
        No se encontraron resultados para "{{ filterText }}"
      </div>
    </div>
  </div>
</template>

