<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const isDark = useData().isDark

const variableData = ref(null)
const variableMetadata = ref(null)
const loading = ref(false)
const error = ref(null)
const idVariable = ref(1)
const timeRange = ref('all')
const limit = ref(100)

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
      text: 'Estadísticas Monetarias BCRA'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('es-AR').format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: function(value) {
          if (Math.abs(value) >= 1000000000) {
            return new Intl.NumberFormat('es-AR', { 
              notation: 'compact',
              compactDisplay: 'short',
              maximumFractionDigits: 1
            }).format(value);
          } else if (Math.abs(value) >= 1000000) {
            return new Intl.NumberFormat('es-AR', { 
              notation: 'compact',
              compactDisplay: 'short',
              maximumFractionDigits: 1
            }).format(value);
          } else if (Math.abs(value) >= 1000) {
            return new Intl.NumberFormat('es-AR', { 
              maximumFractionDigits: 0
            }).format(value);
          } else {
            return new Intl.NumberFormat('es-AR', { 
              maximumFractionDigits: 2
            }).format(value);
          }
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

async function fetchVariableMetadata(id) {
  if (!id) return null

  try {
    const response = await fetch(`https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias?IdVariable=${id}&Limit=1`)
    const data = await response.json()

    if (data.status === 200 && data.results && data.results.length > 0) {
      return data.results[0]
    }
  } catch (err) {
    console.error('Error al cargar metadatos:', err)
  }
  return null
}

async function fetchVariableData(id) {
  if (!id) return

  loading.value = true
  error.value = null

  try {
    const [metadataResponse, dataResponse] = await Promise.all([
      fetchVariableMetadata(id),
      fetch(`https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${id}?Limit=${limit.value}&Offset=0`)
    ])

    const data = await dataResponse.json()

    if (data.status === 200 && data.results && data.results.length > 0) {
      variableData.value = data.results[0]
      variableMetadata.value = metadataResponse
      updateChart()
    } else {
      error.value = 'Error al cargar datos: Respuesta inválida'
      variableData.value = null
      variableMetadata.value = null
      chartData.value = null
    }
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
    variableData.value = null
    variableMetadata.value = null
    chartData.value = null
  } finally {
    loading.value = false
  }
}

function filterDataByTimeRange() {
  if (!variableData.value || !variableData.value.detalle || variableData.value.detalle.length === 0) return []

  const sortedData = [...variableData.value.detalle].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  if (timeRange.value === 'all') {
    return sortedData
  }

  const now = new Date()
  const yearsToFilter = timeRange.value === '1year' ? 1 : 5
  const cutoffDate = new Date()
  cutoffDate.setFullYear(now.getFullYear() - yearsToFilter)

  return sortedData.filter(item => new Date(item.fecha) >= cutoffDate)
}

function updateChart() {
  if (!variableData.value || !variableData.value.detalle || variableData.value.detalle.length === 0) {
    chartData.value = null
    return
  }

  const filteredData = filterDataByTimeRange()
  if (filteredData.length === 0) {
    chartData.value = null
    return
  }

  const labels = filteredData.map(item => {
    const date = new Date(item.fecha)
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  })

  const values = filteredData.map(item => item.valor)

  const chartLabel = variableMetadata.value 
    ? variableMetadata.value.descripcion 
    : `Variable ${variableData.value.idVariable}`

  chartData.value = {
    labels,
    datasets: [
      {
        label: chartLabel,
        data: values,
        borderColor: isDark.value ? 'rgba(75, 192, 192, 1)' : 'rgba(54, 162, 235, 1)',
        backgroundColor: isDark.value ? 'rgba(75, 192, 192, 0.2)' : 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        tension: 0.1
      }
    ]
  }

  const chartTitle = variableMetadata.value 
    ? `${variableMetadata.value.descripcion} (ID: ${variableData.value.idVariable})`
    : `Variable ${variableData.value.idVariable}`

  chartOptions.value.plugins.title.text = chartTitle

  if (variableMetadata.value && variableMetadata.value.unidadExpresion) {
    chartOptions.value.scales.y.title = {
      display: true,
      text: variableMetadata.value.unidadExpresion
    }
  }
}

const handleIdChange = () => {
  if (idVariable.value) {
    fetchVariableData(idVariable.value)
  }
}

watch(timeRange, () => {
  updateChart()
})

onMounted(async () => {
  await fetchVariableData(idVariable.value)
})
</script>

<template>
  <div class="relative">
    <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block mb-2 font-medium text-sm">ID Variable</label>
          <input
            v-model.number="idVariable"
            type="number"
            min="1"
            @change="handleIdChange"
            class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block mb-2 font-medium text-sm">Límite</label>
          <input
            v-model.number="limit"
            type="number"
            min="1"
            max="1000"
            @change="handleIdChange"
            class="w-full px-4 py-2 bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="flex items-end">
          <button 
            @click="handleIdChange" 
            class="w-full px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Buscar
          </button>
        </div>
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

    <div v-else-if="variableData" class="space-y-6">
      <div v-if="variableMetadata" class="p-4 bg-muted rounded-lg border border-transparent">
        <h3 class="text-lg font-semibold mb-3">{{ variableMetadata.descripcion }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-muted-foreground">ID Variable:</span>
            <span class="ml-2 font-medium">{{ variableMetadata.idVariable }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Categoría:</span>
            <span class="ml-2 font-medium">{{ variableMetadata.categoria }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Tipo Serie:</span>
            <span class="ml-2 font-medium">{{ variableMetadata.tipoSerie }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Periodicidad:</span>
            <span class="ml-2 font-medium">{{ variableMetadata.periodicidad }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Unidad:</span>
            <span class="ml-2 font-medium">{{ variableMetadata.unidadExpresion }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Moneda:</span>
            <span class="ml-2 font-medium">{{ variableMetadata.moneda }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Primera Fecha:</span>
            <span class="ml-2 font-medium">{{ new Date(variableMetadata.primerFechaInformada).toLocaleDateString('es-AR') }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Última Fecha:</span>
            <span class="ml-2 font-medium">{{ new Date(variableMetadata.ultFechaInformada).toLocaleDateString('es-AR') }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Último Valor:</span>
            <span class="ml-2 font-medium">{{ new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(variableMetadata.ultValorInformado) }}</span>
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

      <div v-if="variableData.detalle && variableData.detalle.length > 0" class="space-y-4">
        <h3 class="text-lg font-semibold mb-2">Datos Históricos</h3>
        <div class="text-sm text-muted-foreground mb-2">
          Mostrando {{ variableData.detalle.length }} registros
        </div>
        <div class="max-h-96 overflow-y-auto">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in variableData.detalle.slice().reverse()" :key="index">
                <td>{{ new Date(item.fecha).toLocaleDateString('es-AR') }}</td>
                <td>{{ new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(item.valor) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-muted-foreground">
      No hay datos disponibles
    </div>
  </div>
</template>

