<script setup>
import { computed, onMounted, ref } from 'vue'

const metodologiaData = ref(null)
const loading = ref(false)
const error = ref(null)
const idVariable = ref(1)

async function fetchMetodologiaData(id) {
  if (!id) return

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`https://api.bcra.gob.ar/estadisticas/v4.0/Metodologia/${id}`)
    const data = await response.json()

    if (data.status === 200 && data.results && data.results.length > 0) {
      metodologiaData.value = data.results[0]
    } else {
      error.value = 'Error al cargar datos: Respuesta inválida'
      metodologiaData.value = null
    }
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
    metodologiaData.value = null
  } finally {
    loading.value = false
  }
}

const handleIdChange = () => {
  if (idVariable.value) {
    fetchMetodologiaData(idVariable.value)
  }
}

onMounted(async () => {
  await fetchMetodologiaData(idVariable.value)
})
</script>

<template>
  <div class="relative">
    <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10 mb-4">
      <div class="flex gap-2 items-end">
        <div class="flex-1">
          <label class="block mb-2 font-medium text-sm">ID Variable</label>
          <input
            v-model.number="idVariable"
            type="number"
            min="1"
            @change="handleIdChange"
            class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button 
          @click="handleIdChange" 
          class="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Buscar
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="handleIdChange" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Reintentar
      </button>
    </div>

    <div v-else-if="metodologiaData" class="space-y-4">
      <div class="p-4 bg-muted rounded-lg border border-transparent">
        <div class="flex items-start justify-between gap-4 mb-2">
          <span class="text-xs text-muted-foreground font-medium">ID: {{ metodologiaData.id }}</span>
        </div>
        <p class="text-sm">{{ metodologiaData.detalle }}</p>
      </div>
    </div>

    <div v-else class="text-center py-8 text-muted-foreground">
      No hay datos disponibles
    </div>
  </div>
</template>

