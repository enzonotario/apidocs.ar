<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const isDark = useData().isDark

const allMonetaryData = ref([])
const variableData = ref([])
const filteredData = ref([])
const loading = ref(false)
const error = ref(null)

const categories = ref([])
const selectedCategory = ref('')
const variables = ref([])
const selectedVariable = ref(null)
const timeRange = ref('all')

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

async function fetchMonetaryData() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias')
    const data = await response.json()

    if (data.status === 200 && data.results) {
      allMonetaryData.value = data.results

      const uniqueCategories = [...new Set(data.results.map(item => item.categoria))]
      categories.value = uniqueCategories

      if (uniqueCategories.length > 0) {
        selectedCategory.value = uniqueCategories[0]
      }
    } else {
      error.value = 'Error al cargar datos: Respuesta inválida'
    }
  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`
  } finally {
    loading.value = false
  }
}

async function fetchVariableData(id) {
  if (!id) return

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias/${id}`)
    const data = await response.json()

    if (data && data.results && Array.isArray(data.results)) {
      variableData.value = data.results

      if (variableData.value.length > 0) {
        updateChart()
      } else {
        chartData.value = null
      }
    } else {
      error.value = 'Error al cargar datos de la variable: Respuesta inválida'
      variableData.value = []
      chartData.value = null
    }
  } catch (err) {
    error.value = `Error al cargar datos de la variable: ${err.message}`
    variableData.value = []
    chartData.value = null
  } finally {
    loading.value = false
  }
}

const filteredVariables = computed(() => {
  if (!selectedCategory.value) return []
  return allMonetaryData.value.filter(item => item.categoria === selectedCategory.value)
})

const uniqueVariables = computed(() => {
  const variableMap = new Map()

  filteredVariables.value.forEach(item => {
    if (!variableMap.has(item.idVariable)) {
      variableMap.set(item.idVariable, {
        id: item.idVariable,
        descripcion: item.descripcion
      })
    }
  })

  return Array.from(variableMap.values())
})

function filterDataByTimeRange() {
  if (!variableData.value || variableData.value.length === 0) return []

  const now = new Date()
  const sortedData = [...variableData.value].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  if (timeRange.value === 'all') {
    return sortedData
  }

  const yearsToFilter = timeRange.value === '1year' ? 1 : 5
  const cutoffDate = new Date()
  cutoffDate.setFullYear(now.getFullYear() - yearsToFilter)

  return sortedData.filter(item => new Date(item.fecha) >= cutoffDate)
}

function updateChart() {
  if (!selectedVariable.value || variableData.value.length === 0) return

  const variableInfo = allMonetaryData.value.find(item => item.idVariable === selectedVariable.value)
  if (!variableInfo) return

  filteredData.value = filterDataByTimeRange()
  if (filteredData.value.length === 0) return

  const labels = filteredData.value.map(item => {
    const date = new Date(item.fecha)
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  })

  const values = filteredData.value.map(item => item.valor)

  chartData.value = {
    labels,
    datasets: [
      {
        label: variableInfo.descripcion,
        data: values,
        borderColor: isDark.value ? 'rgba(75, 192, 192, 1)' : 'rgba(54, 162, 235, 1)',
        backgroundColor: isDark.value ? 'rgba(75, 192, 192, 0.2)' : 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        tension: 0.1
      }
    ]
  }

  chartOptions.value.plugins.title.text = variableInfo.descripcion

  let yAxisTitle = 'Valor'
  const desc = variableInfo.descripcion.toLowerCase()

  if (desc.includes('dólares') || desc.includes('usd')) {
    yAxisTitle = 'USD'
  } else if (desc.includes('pesos') || desc.includes('$')) {
    yAxisTitle = 'Pesos'
  } else if (desc.includes('%')) {
    yAxisTitle = 'Porcentaje'
  } else if (desc.includes('millones')) {
    yAxisTitle = 'Millones'
  }

  chartOptions.value.scales.y.title = {
    display: true,
    text: yAxisTitle
  }
}

watch(selectedCategory, () => {
  selectedVariable.value = uniqueVariables.value.length > 0 ? uniqueVariables.value[0].id : null
})

watch(selectedVariable, async (newValue) => {
  if (newValue) {
    await fetchVariableData(newValue)
  }
})

watch(timeRange, () => {
  updateChart()
})

onMounted(async () => {
  await fetchMonetaryData()
  if (selectedVariable.value) {
    await fetchVariableData(selectedVariable.value)
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
      <button @click="fetchMonetaryData" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Reintentar
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="sticky top-[var(--vp-nav-height)] bg-muted/80 backdrop-blur-sm p-2 rounded-b z-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 font-medium">Categoría</label>
            <select
                v-model="selectedCategory"
                class="w-full p-2 bg-muted rounded"
            >
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div>
            <label class="block mb-2 font-medium">Variable</label>
            <select
                v-model="selectedVariable"
                class="w-full p-2 bg-muted rounded"
            >
              <option v-for="variable in uniqueVariables" :key="variable.id" :value="variable.id">
                {{ variable.descripcion }}
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
            v-if="chartData.labels.length > 5"
            :data="chartData" 
            :options="chartOptions"
          />
          <Bar 
            v-else
            :data="chartData" 
            :options="chartOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>
