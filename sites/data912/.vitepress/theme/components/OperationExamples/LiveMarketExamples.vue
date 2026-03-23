<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
})

const data = ref([])
const loading = ref(false)
const error = ref(null)
const filterText = ref('')

async function fetchData() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(props.url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    data.value = await response.json()
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

const filteredData = computed(() => {
  if (!filterText.value) return data.value
  const q = filterText.value.toLowerCase()
  return data.value.filter(item => item.symbol?.toLowerCase().includes(q))
})

const fmt = (n) => n != null ? new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n) : '-'
const fmtPct = (n) => n != null ? `${(n * 100).toFixed(2)}%` : '-'

onMounted(fetchData)
</script>


<template>
  <div class="relative">
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="fetchData" class="px-4 py-2 bg-primary text-primary-foreground rounded">Reintentar</button>
    </div>

    <div v-else>
      <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10 mb-4">
        <input
          v-model="filterText"
          type="text"
          placeholder="Filtrar por símbolo..."
          class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Símbolo</th>
            <th>Precio</th>
            <th>Bid</th>
            <th>Ask</th>
            <th>Cant. Bid</th>
            <th>Cant. Ask</th>
            <th>Volumen</th>
            <th>Operaciones</th>
            <th>% Cambio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredData" :key="item.symbol">
            <td class="font-mono font-semibold">{{ item.symbol }}</td>
            <td class="font-semibold">{{ fmt(item.c) }}</td>
            <td>{{ fmt(item.px_bid) }}</td>
            <td>{{ fmt(item.px_ask) }}</td>
            <td>{{ fmt(item.q_bid) }}</td>
            <td>{{ fmt(item.q_ask) }}</td>
            <td>{{ fmt(item.v) }}</td>
            <td>{{ fmt(item.q_op) }}</td>
            <td :class="item.pct_change > 0 ? 'text-green-600 dark:text-green-400' : item.pct_change < 0 ? 'text-red-600 dark:text-red-400' : ''">
              {{ fmtPct(item.pct_change) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredData.length === 0" class="text-center py-8 text-muted-foreground">
        No se encontraron resultados
      </div>
    </div>
  </div>
</template>
