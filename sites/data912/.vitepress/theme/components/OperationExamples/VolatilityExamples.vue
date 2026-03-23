<script setup>
import { onMounted, ref } from 'vue'

const ticker = ref('AAPL')
const data = ref(null)
const loading = ref(false)
const error = ref(null)

async function fetchData() {
  if (!ticker.value) return
  loading.value = true
  error.value = null
  data.value = null
  try {
    const response = await fetch(`https://data912.com/eod/volatilities/${ticker.value}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    data.value = await response.json()
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

const fmtPct = (n) => n != null ? `${(n * 100).toFixed(2)}%` : '-'
const fmtPctile = (n) => n != null ? `${(n * 100).toFixed(1)}p` : '-'

const metrics = [
  { key: 'iv_s_term', label: 'IV Corto Plazo', pctKey: 'iv_s_term_percentile' },
  { key: 'iv_m_term', label: 'IV Mediano Plazo', pctKey: 'iv_m_term_percentile' },
  { key: 'iv_l_term', label: 'IV Largo Plazo', pctKey: 'iv_l_term_percentile' },
  { key: 'hv_s_term', label: 'HV Corto Plazo', pctKey: 'hv_s_term_percentile' },
  { key: 'hv_m_term', label: 'HV Mediano Plazo', pctKey: 'hv_m_term_percentile' },
  { key: 'hv_l_term', label: 'HV Largo Plazo', pctKey: 'hv_l_term_percentile' },
  { key: 'fair_iv', label: 'IV Justa', pctKey: 'fair_iv_percentile' },
  { key: 'iv_fair_iv_ratio', label: 'IV/Fair IV', pctKey: 'iv_fair_iv_ratio_percentile' },
  { key: 'iv_hv_s_ratio', label: 'IV/HV Corto', pctKey: 'iv_hv_s_ratio_percentile' },
  { key: 'iv_hv_m_ratio', label: 'IV/HV Mediano', pctKey: 'iv_hv_m_ratio_percentile' },
  { key: 'iv_hv_l_ratio', label: 'IV/HV Largo', pctKey: 'iv_hv_l_ratio_percentile' },
]

onMounted(fetchData)
</script>

<template>
  <div class="relative">
    <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10 mb-4">
      <div class="flex gap-4 items-end">
        <div class="flex-1">
          <label class="block mb-2 font-medium text-sm">Ticker (USA)</label>
          <input
            v-model="ticker"
            type="text"
            placeholder="Ej: AAPL"
            class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary uppercase"
            @keyup.enter="fetchData"
          />
        </div>
        <button @click="fetchData" class="px-4 py-2 bg-primary text-primary-foreground rounded">
          Buscar
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="fetchData" class="px-4 py-2 bg-primary text-primary-foreground rounded">Reintentar</button>
    </div>

    <div v-else-if="data" class="space-y-4">
      <h3 class="text-lg font-semibold">Métricas de Volatilidad — {{ ticker.toUpperCase() }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="m in metrics"
          :key="m.key"
          class="p-4 bg-muted rounded-lg"
        >
          <div class="text-sm text-muted-foreground mb-1">{{ m.label }}</div>
          <div class="text-2xl font-bold">{{ fmtPct(data[m.key]) }}</div>
          <div class="text-xs text-muted-foreground mt-1">Percentil: {{ fmtPctile(data[m.pctKey]) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-muted-foreground">
      Ingresá un ticker y hacé click en Buscar
    </div>
  </div>
</template>
