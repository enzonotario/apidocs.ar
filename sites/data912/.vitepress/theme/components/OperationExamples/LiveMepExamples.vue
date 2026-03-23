<script setup>
import { onMounted, ref } from 'vue'

const data = ref([])
const loading = ref(false)
const error = ref(null)

async function fetchData() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('https://data912.com/live/mep')
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
      <h3>Dólar MEP en vivo</h3>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Panel</th>
            <th>Bid ARS</th>
            <th>Ask ARS</th>
            <th>Bid USD</th>
            <th>Ask USD</th>
            <th>MEP (bid)</th>
            <th>MEP (ask)</th>
            <th>MEP (close)</th>
            <th>MEP (mark)</th>
            <th>Vol ARS</th>
            <th>Vol USD</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.ticker">
            <td class="font-mono font-semibold">{{ item.ticker }}</td>
            <td>{{ item.panel }}</td>
            <td>{{ fmt(item.ars_bid) }}</td>
            <td>{{ fmt(item.ars_ask) }}</td>
            <td>{{ fmt(item.usd_bid) }}</td>
            <td>{{ fmt(item.usd_ask) }}</td>
            <td>{{ fmt(item.bid) }}</td>
            <td>{{ fmt(item.ask) }}</td>
            <td>{{ fmt(item.close) }}</td>
            <td class="font-semibold">{{ fmt(item.mark) }}</td>
            <td>{{ fmt(item.v_ars) }}</td>
            <td>{{ fmt(item.v_usd) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="data.length === 0" class="text-center py-8 text-muted-foreground">No hay datos disponibles</div>
    </div>
  </div>
</template>
