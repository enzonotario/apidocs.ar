<script setup>
import { ref, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'
import { format, subYears, isAfter } from 'date-fns'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const isDark = useData().isDark

const currencies = ref([])
const selectedCurrency = ref('USD')
const cotizacionesData = ref([])
const loading = ref(false)
const error = ref(null)
const timeRange = ref('1year')

const chartData = ref(null)
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Cotizaciones BCRA'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y;
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'Cotización'
      },
      ticks: {
        callback: function(value) {
          return value;
        }
      }
    },
    x: {
      title: {
        display: true,
        text: 'Fecha'
      }
    }
  }
})

async function fetchCurrencies() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Maestros/Divisas')
    const data = await response.json()

    if (data.status === 200 && data.results) {
      currencies.value = data.results
    } else {
      error.value = 'Error al cargar divisas: Respuesta inválida'
    }
  } catch (err) {
    error.value = `Error al cargar divisas: ${err.message}`
  } finally {
    loading.value = false
  }
}

async function fetchCotizaciones(currencyCode) {
  if (!currencyCode) return

  loading.value = true
  error.value = null

  try {
    const fechaDesde = '1992-01-02'
    const fechaHasta = format(new Date(), 'yyyy-MM-dd')

    const response = await fetch(`https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones/${currencyCode}?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`)
    const data = await response.json()

    if (data.status === 200 && data.results) {
      cotizacionesData.value = data.results.reverse()
      updateChart()
    } else {
      error.value = 'Error al cargar cotizaciones: Respuesta inválida'
      cotizacionesData.value = []
      chartData.value = null
    }
  } catch (err) {
    error.value = `Error al cargar cotizaciones: ${err.message}`
    cotizacionesData.value = []
    chartData.value = null
  } finally {
    loading.value = false
  }
}

function filterDataByTimeRange() {
  if (!cotizacionesData.value || cotizacionesData.value.length === 0) return []

  if (timeRange.value === 'all') {
    return cotizacionesData.value
  }

  const yearsToFilter = timeRange.value === '1year' ? 1 : 
                        timeRange.value === '3years' ? 3 : 5
  const now = new Date()
  const cutoffDate = subYears(now, yearsToFilter)

  return cotizacionesData.value.filter(item => isAfter(new Date(item.fecha), cutoffDate) || 
                                              new Date(item.fecha).getTime() === cutoffDate.getTime())
}

function updateChart() {
  if (cotizacionesData.value.length === 0) return

  const filteredData = filterDataByTimeRange()
  if (filteredData.length === 0) return

  const labels = filteredData.map(item => {
    return format(new Date(item.fecha), 'dd/MM/yyyy')
  })

  const values = filteredData.map(item => {
    if (item.detalle && item.detalle.length > 0) {
      return item.detalle[0].tipoCotizacion
    }
    return null
  }).filter(value => value !== null)

  let currencyDescription = selectedCurrency.value
  if (filteredData.length > 0 && filteredData[0].detalle && filteredData[0].detalle.length > 0) {
    currencyDescription = filteredData[0].detalle[0].descripcion
  }

  chartData.value = {
    labels,
    datasets: [
      {
        label: currencyDescription,
        data: values,
        borderColor: isDark.value ? 'rgba(75, 192, 192, 1)' : 'rgba(54, 162, 235, 1)',
        backgroundColor: isDark.value ? 'rgba(75, 192, 192, 0.2)' : 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        tension: 0.1
      }
    ]
  }

  chartOptions.value.plugins.title.text = `Cotizaciones ${currencyDescription}`
}

watch(selectedCurrency, async (newValue) => {
  if (newValue) {
    await fetchCotizaciones(newValue)
  }
})

watch(timeRange, () => {
  updateChart()
})

onMounted(async () => {
  await fetchCurrencies()
  if (selectedCurrency.value) {
    await fetchCotizaciones(selectedCurrency.value)
  }
})
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded space-y-2">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <button @click="selectedCurrency ? fetchCotizaciones(selectedCurrency) : fetchCurrencies()" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Reintentar
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 font-medium">Moneda</label>
            <select
                v-model="selectedCurrency"
                class="w-full p-2 bg-muted rounded"
            >
              <option v-for="currency in currencies" :key="currency.codigo" :value="currency.codigo">
                {{ currency.denominacion }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="chartData" class="space-y-4">
        <div class="flex justify-end space-x-2">
          <button 
            @click="timeRange = '1year'" 
            :class="['px-3 py-1 rounded text-sm', timeRange === '1year' ? 'bg-primary text-primary-foreground' : 'bg-muted']"
          >
            1 año
          </button>
          <button 
            @click="timeRange = '3years'" 
            :class="['px-3 py-1 rounded text-sm', timeRange === '3years' ? 'bg-primary text-primary-foreground' : 'bg-muted']"
          >
            3 años
          </button>
          <button 
            @click="timeRange = '5years'" 
            :class="['px-3 py-1 rounded text-sm', timeRange === '5years' ? 'bg-primary text-primary-foreground' : 'bg-muted']"
          >
            5 años
          </button>
          <button 
            @click="timeRange = 'all'" 
            :class="['px-3 py-1 rounded text-sm', timeRange === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted']"
          >
            Todo
          </button>
        </div>
        <div class="h-[400px]">
          <Line 
            :data="chartData" 
            :options="chartOptions"
          />
        </div>
      </div>

      <div v-if="cotizacionesData.length > 0" class="space-y-6">
        <h3 class="text-lg font-semibold mb-2">Última cotización disponible</h3>
        <div class="bg-muted p-4 rounded">
          <p><strong>Fecha:</strong> {{ format(new Date(cotizacionesData[cotizacionesData.length - 1].fecha), 'dd/MM/yyyy') }}</p>
          <p v-if="cotizacionesData[cotizacionesData.length - 1].detalle && cotizacionesData[cotizacionesData.length - 1].detalle.length > 0">
            <strong>Cotización:</strong> {{ cotizacionesData[cotizacionesData.length - 1].detalle[0].tipoCotizacion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
