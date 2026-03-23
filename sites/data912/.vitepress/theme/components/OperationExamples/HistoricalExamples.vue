<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  urlBase: { type: String, required: true },
  defaultTicker: { type: String, default: 'GGAL' },
})

const isDark = useData().isDark
const ticker = ref(props.defaultTicker)
const data = ref([])
const loading = ref(false)
const error = ref(null)
const timeRange = ref('all')

async function fetchData() {
  if (!ticker.value) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${props.urlBase}${ticker.value}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    data.value = await response.json()
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
    data.value = []
  } finally {
    loading.value = false
  }
}

const filteredData = computed(() => {
  if (!data.value.length) return []
  const sorted = [...data.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  if (timeRange.value === 'all') return sorted
  const now = new Date()
  const years = timeRange.value === '1year' ? 1 : 5
  const cutoff = new Date(now.getFullYear() - years, now.getMonth(), now.getDate())
  return sorted.filter(item => new Date(item.date) >= cutoff)
})

const chartData = computed(() => {
  if (!filteredData.value.length) return null
  return {
    labels: filteredData.value.map(item => new Date(item.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })),
    datasets: [{
      label: `${ticker.value} - Cierre`,
      data: filteredData.value.map(item => item.c),
      borderColor: isDark.value ? 'rgba(75, 192, 192, 1)' : 'rgba(54, 162, 235, 1)',
      backgroundColor: isDark.value ? 'rgba(75, 192, 192, 0.2)' : 'rgba(54, 162, 235, 0.2)',
      borderWidth: 2,
      tension: 0.1,
      pointRadius: filteredData.value.length > 200 ? 0 : 2,
    }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(ctx.parsed.y)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: (v) => new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(v),
      },
    },
    x: { title: { display: true, text: 'Fecha' } },
  },
}

const fmt = (n) => n != null ? new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n) : '-'
const fmtPct = (n) => n != null ? `${(n * 100).toFixed(2)}%` : '-'

watch(timeRange, () => {})

onMounted(fetchData)
</script>

<template>
  <div class="relative">
    <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10 mb-4">
      <div class="flex gap-4 items-end">
        <div class="flex-1">
          <label class="block mb-2 font-medium text-sm">Ticker</label>
          <input
            v-model="ticker"
            type="text"
            :placeholder="`Ej: ${defaultTicker}`"
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

    <div v-else-if="data.length > 0" class="space-y-6">
      <div v-if="chartData" class="space-y-2">
        <div class="flex justify-end gap-2">
          <button
            v-for="range in [{ key: '1year', label: '1 año' }, { key: '5years', label: '5 años' }, { key: 'all', label: 'Todo' }]"
            :key="range.key"
            @click="timeRange = range.key"
            :class="['px-3 py-1 rounded text-sm', timeRange === range.key ? 'bg-primary text-primary-foreground' : 'bg-muted']"
          >
            {{ range.label }}
          </button>
        </div>
        <div class="h-[400px]">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Datos Históricos OHLCV — {{ ticker.toUpperCase() }}</h3>
        <div class="text-sm text-muted-foreground">{{ filteredData.length }} registros</div>
        <div class="max-h-96 overflow-y-auto">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Apertura</th>
                <th>Máximo</th>
                <th>Mínimo</th>
                <th>Cierre</th>
                <th>Volumen</th>
                <th>Ret. Diario</th>
                <th>Ret. Ajust.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in [...filteredData].reverse()" :key="item.date">
                <td>{{ new Date(item.date).toLocaleDateString('es-AR') }}</td>
                <td>{{ fmt(item.o) }}</td>
                <td>{{ fmt(item.h) }}</td>
                <td>{{ fmt(item.l) }}</td>
                <td class="font-semibold">{{ fmt(item.c) }}</td>
                <td>{{ fmt(item.v) }}</td>
                <td :class="item.dr > 0 ? 'text-green-600 dark:text-green-400' : item.dr < 0 ? 'text-red-600 dark:text-red-400' : ''">
                  {{ fmtPct(item.dr) }}
                </td>
                <td>{{ fmtPct(item.sa) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-muted-foreground">
      Ingresá un ticker y hacé click en Buscar
    </div>
  </div>
</template>
