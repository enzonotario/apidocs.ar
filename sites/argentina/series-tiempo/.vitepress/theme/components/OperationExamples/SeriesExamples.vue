<script setup>
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const isDark = useData().isDark
const loading = ref(true)
const error = ref(null)
const data = ref(null)
const searchResults = ref(null)
const searchLoading = ref(false)
const searchError = ref(null)
const searchQuery = ref('supermercados')
const debouncedSearchQuery = ref(searchQuery.value)
const selectedSeries = ref([
  '455.1_TARJETAS_DITO_0_M_15_92',
  '455.1_TARJETAS_CITO_0_M_16_85',
  '455.1_EFECTIVOIVO_0_M_8_15',
  '455.1_OTROS_MEDIIOS_0_M_12_32',
])

const representationMode = ref('value')
const collapseAggregation = ref('avg')
const collapse = ref('month')
const startDate = ref('')
const endDate = ref('')
const sortOrder = ref('asc')

const seriesIds = computed(() => {
  return selectedSeries.value
})

const apiUrl = computed(() => {
  if (seriesIds.value.length === 0) return ''

  let url = `https://apis.datos.gob.ar/series/api/series?ids=${seriesIds.value.join(',')}&format=json`

  if (representationMode.value) {
    url += `&representation_mode=${representationMode.value}`
  }

  if (collapseAggregation.value) {
    url += `&collapse_aggregation=${collapseAggregation.value}`
  }

  if (collapse.value) {
    url += `&collapse=${collapse.value}`
  }

  if (startDate.value) {
    url += `&start_date=${startDate.value}`
  }

  if (endDate.value) {
    url += `&end_date=${endDate.value}`
  }

  if (sortOrder.value) {
    url += `&sort=${sortOrder.value}`
  }

  return url
})

async function fetchData() {
  if (seriesIds.value.length === 0) return

  loading.value = true
  error.value = null

  try {
    const url = apiUrl.value
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status}`)
    }
    data.value = await response.json()
    loading.value = false
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}

async function searchSeries() {
  if (!debouncedSearchQuery.value.trim()) return

  searchLoading.value = true
  searchError.value = null

  try {
    const response = await fetch(`https://apis.datos.gob.ar/series/api/search?q=${encodeURIComponent(debouncedSearchQuery.value)}&limit=100&format=json&sort_by=hits_90_days`)
    if (!response.ok) {
      throw new Error(`Error fetching search results: ${response.status}`)
    }
    searchResults.value = await response.json()
    searchLoading.value = false
  } catch (err) {
    searchError.value = err.message
    searchLoading.value = false
  }
}

function toggleSeries(seriesId) {
  const index = selectedSeries.value.indexOf(seriesId)
  if (index === -1) {
    selectedSeries.value.push(seriesId)
  } else {
    selectedSeries.value.splice(index, 1)
  }
}

function clearAllSeries() {
  selectedSeries.value = []
}

let debounceTimeout = null
watch(searchQuery, (newValue) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)

  debounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newValue
  }, 300)
})

watch(debouncedSearchQuery, () => {
  searchSeries()
})

watch(
  [representationMode, collapseAggregation, collapse, startDate, endDate, sortOrder],
  () => {
    fetchData()
  }
)

watch(seriesIds, () => {
  fetchData()
}, { deep: true })

fetchData()
searchSeries()

const chartData = computed(() => {
  if (!data.value) return { labels: [], datasets: [] }

  const dates = data.value.data.map(item => item[0])

  return {
    labels: dates,
    datasets: data.value.meta.filter(meta => meta.field).map((meta, index) => ({
      label: meta.field.description,
      data: data.value.data.map(item => item[index + 1]),
      borderColor: getColor(index),
      backgroundColor: getColor(index, 0.2),
      tension: 0.1
    }))
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark.value ? 'white' : 'black'
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark.value ? 'white' : 'black'
        },
        grid: {
          color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        ticks: {
          color: isDark.value ? 'white' : 'black'
        },
        grid: {
          color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }
})

function getColor(index, alpha = 1) {
  const colors = [
    `rgba(54, 162, 235, ${alpha})`,
    `rgba(255, 99, 132, ${alpha})`,
    `rgba(75, 192, 192, ${alpha})`,
    `rgba(255, 206, 86, ${alpha})`,
    `rgba(153, 102, 255, ${alpha})`,
    `rgba(255, 159, 64, ${alpha})`
  ]
  return colors[index % colors.length]
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded border space-y-2">
      <div class="px-3 pt-3 space-y-2">
        <h3 class="!mt-0">Buscar Series</h3>

        <div class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar series (ej: ipc, pbi, desempleo)"
            class="flex-grow p-2 bg-muted rounded"
          />
        </div>

        <div v-if="selectedSeries.length > 0" class="pt-2 space-y-2">
          <div class="flex justify-between items-center">
            <h4 class="!mt-0">Series seleccionadas</h4>
            <button @click="clearAllSeries" class="text-red-700 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm">Quitar todas</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="serieId in selectedSeries"
              :key="serieId"
              class="px-2 py-1 bg-muted rounded-full flex items-center gap-2 text-xs"
            >
              <span>{{ serieId }}</span>
              <button @click="toggleSeries(serieId)" class="text-red-500 hover:text-red-700">×</button>
            </div>
          </div>
        </div>

        <div v-if="searchError" class="text-red-500 ">
          {{ searchError }}
        </div>
      </div>

      <div v-if="searchResults && searchResults.data && searchResults.data.length > 0" class="space-y-2">
        <span class="px-2 font-bold text-sm text-muted-foreground">Resultados de búsqueda ({{ searchResults.count }} encontrados):</span>
        <div class="max-h-80 overflow-y-auto">
          <div
              v-for="(item, index) in searchResults.data"
              :key="index"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 flex items-start gap-2"
          >
            <input
                type="checkbox"
                :id="'serie-' + index"
                :checked="selectedSeries.includes(item.field.id)"
                @change="toggleSeries(item.field.id)"
                class="mt-2"
            />
            <label :for="'serie-' + index" class="cursor-pointer flex-grow">
              <div class="font-bold">{{ item.field.title }}</div>
              <div class="text-sm text-muted-foreground">ID: {{ item.field.id }}</div>
              <div class="text-sm">{{ item.field.description }}</div>
              <div class="flex flex-wrap justify-between gap-2">
                <div class="text-sm text-muted-foreground">
                  {{ item.field.frequency }} - {{ item.field.units }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ item.field.time_index_start }} - {{ item.field.time_index_end }}
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div v-else-if="searchResults && searchResults.data && searchResults.data.length === 0" class="px-2">
        No se encontraron resultados para "{{ searchQuery }}".
      </div>
    </div>

    <div class="p-3 rounded border space-y-2">
      <div class="space-y-2">
        <h4 class="!mt-0">Filtros adicionales</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="block text-sm font-medium">Modo de representación</label>
            <select v-model="representationMode" class="w-full p-2 bg-muted rounded">
              <option value="value">Valor</option>
              <option value="change">Cambio</option>
              <option value="percent_change">Cambio porcentual</option>
              <option value="change_a_year_ago">Cambio respecto al año anterior</option>
              <option value="percent_change_a_year_ago">Cambio porcentual respecto al año anterior</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-medium">Agregación</label>
            <select v-model="collapseAggregation" class="w-full p-2 bg-muted rounded">
              <option value="avg">Promedio</option>
              <option value="sum">Suma</option>
              <option value="end_of_period">Fin de período</option>
              <option value="min">Mínimo</option>
              <option value="max">Máximo</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-medium">Intervalo de tiempo</label>
            <select v-model="collapse" class="w-full p-2 bg-muted rounded">
              <option value="year">Anual</option>
              <option value="semester">Semestral</option>
              <option value="quarter">Trimestral</option>
              <option value="month">Mensual</option>
              <option value="week">Semanal</option>
              <option value="day">Diario</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-medium">Orden</label>
            <select v-model="sortOrder" class="w-full p-2 bg-muted rounded">
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-medium">Fecha de inicio</label>
            <input type="text" v-model="startDate" placeholder="AAAA-MM-DD" class="w-full p-2 bg-muted rounded" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-medium">Fecha de fin</label>
            <input type="text" v-model="endDate" placeholder="AAAA-MM-DD" class="w-full p-2 bg-muted rounded" />
          </div>

        </div>
      </div>
    </div>

    <h3>URL</h3>
    <code class="select-all break-all">{{ apiUrl }}</code>

    <div v-if="loading" class="text-center">
      Cargando datos...
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      {{ error }}
    </div>

    <template v-else-if="data">
      <h3>Gráfico de series de tiempo</h3>
      <div class="h-96">
        <Line :data="chartData" :options="chartOptions" />
      </div>

      <h3>Valores de las series</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th v-for="(meta, index) in data.meta.filter(meta => meta.field)" :key="index">
              {{ meta.field ? meta.field.description : 'Serie ' + index }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in data.data" :key="rowIndex">
            <td>{{ row[0] }}</td>
            <td v-for="(value, colIndex) in row.slice(1)" :key="colIndex">{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>
