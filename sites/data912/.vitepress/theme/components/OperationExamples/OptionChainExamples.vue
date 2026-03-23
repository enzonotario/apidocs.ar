<script setup>
import { computed, onMounted, ref } from 'vue'

const ticker = ref('AAPL')
const data = ref([])
const loading = ref(false)
const error = ref(null)
const filterType = ref('')
const filterExpiry = ref('')

async function fetchData() {
  if (!ticker.value) return
  loading.value = true
  error.value = null
  data.value = []
  try {
    const response = await fetch(`https://data912.com/eod/option_chain/${ticker.value}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    data.value = await response.json()
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

const expirations = computed(() => [...new Set(data.value.map(i => i.opex))].sort())

const filteredData = computed(() => {
  let result = data.value
  if (filterType.value) result = result.filter(i => i.type === filterType.value)
  if (filterExpiry.value) result = result.filter(i => i.opex === filterExpiry.value)
  return result
})

const fmt = (n) => n != null ? new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 }).format(n) : '-'
const fmtPct = (n) => n != null ? `${(n * 100).toFixed(1)}%` : '-'

onMounted(fetchData)
</script>

<template>
  <div class="relative">
    <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block mb-2 font-medium text-sm">Ticker (USA)</label>
          <input
            v-model="ticker"
            type="text"
            placeholder="Ej: AAPL"
            class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary uppercase"
            @keyup.enter="fetchData"
          />
        </div>
        <div>
          <label class="block mb-2 font-medium text-sm">Tipo</label>
          <select v-model="filterType" class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Todos</option>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </div>
        <div>
          <label class="block mb-2 font-medium text-sm">Vencimiento</label>
          <select v-model="filterExpiry" class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Todos</option>
            <option v-for="exp in expirations" :key="exp" :value="exp">{{ exp }}</option>
          </select>
        </div>
      </div>
      <button @click="fetchData" class="mt-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded sm:hidden">
        Buscar
      </button>
      <button @click="fetchData" class="hidden sm:inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded">
        Buscar
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="fetchData" class="px-4 py-2 bg-primary text-primary-foreground rounded">Reintentar</button>
    </div>

    <div v-else-if="data.length > 0">
      <div class="text-sm text-muted-foreground mb-2">{{ filteredData.length }} contratos</div>
      <div class="max-h-[600px] overflow-y-auto">
        <table>
          <thead>
            <tr>
              <th>Venc.</th>
              <th>Tipo</th>
              <th>Strike</th>
              <th>Cierre</th>
              <th>Bid</th>
              <th>Ask</th>
              <th>IV</th>
              <th>Fair IV</th>
              <th>Delta</th>
              <th>Gamma</th>
              <th>Theta</th>
              <th>Vega</th>
              <th>OI</th>
              <th>ITM %</th>
              <th>Días</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in filteredData" :key="i">
              <td>{{ item.opex }}</td>
              <td :class="item.type === 'call' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'">
                {{ item.type }}
              </td>
              <td class="font-semibold">{{ fmt(item.k) }}</td>
              <td>{{ fmt(item.c) }}</td>
              <td>{{ fmt(item.bid) }}</td>
              <td>{{ fmt(item.ask) }}</td>
              <td>{{ fmtPct(item.iv) }}</td>
              <td>{{ fmtPct(item.fair_iv) }}</td>
              <td>{{ fmt(item.delta) }}</td>
              <td>{{ fmt(item.gamma) }}</td>
              <td>{{ fmt(item.theta) }}</td>
              <td>{{ fmt(item.vega) }}</td>
              <td>{{ fmt(item.oi) }}</td>
              <td>{{ fmtPct(item.itm_prob) }}</td>
              <td>{{ item.r_days }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="text-center py-8 text-muted-foreground">
      Ingresá un ticker y hacé click en Buscar
    </div>
  </div>
</template>
