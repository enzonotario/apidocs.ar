<script setup>
import { onMounted, ref } from 'vue'

const data = ref([])
const loading = ref(false)
const error = ref(null)

async function fetchData() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('https://data912.com/live/ccl')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    data.value = await response.json()
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

const fmt = (n) => n != null ? new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n) : '-'

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
      <h3>Dólar CCL en vivo</h3>
      <table>
        <thead>
          <tr>
            <th>Ticker AR</th>
            <th>Ticker USA</th>
            <th>Panel AR</th>
            <th>Panel USA</th>
            <th>CCL Bid</th>
            <th>CCL Ask</th>
            <th>CCL Close</th>
            <th>CCL Mark</th>
            <th>Vol ARS</th>
            <th>Rank Vol</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.ticker_ar">
            <td class="font-mono font-semibold">{{ item.ticker_ar }}</td>
            <td class="font-mono">{{ item.ticker_usa }}</td>
            <td>{{ item.arg_panel }}</td>
            <td>{{ item.usa_panel }}</td>
            <td>{{ fmt(item.CCL_bid) }}</td>
            <td>{{ fmt(item.CCL_ask) }}</td>
            <td>{{ fmt(item.CCL_close) }}</td>
            <td class="font-semibold">{{ fmt(item.CCL_mark) }}</td>
            <td>{{ fmt(item.ars_volume) }}</td>
            <td>{{ item.volume_rank }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="data.length === 0" class="text-center py-8 text-muted-foreground">No hay datos disponibles</div>
    </div>
  </div>
</template>
