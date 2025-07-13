<script setup>
import { computed, ref, onMounted } from 'vue'
import { Bar, Pie, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const isDark = useData().isDark
const isLoading = ref(true)
const error = ref(null)
const data = ref([])

onMounted(async () => {
  try {
    const response = await fetch('https://www.cultura.gob.ar/api/v2.0/tramites/?format=json')

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`)
    }

    const result = await response.json()
    data.value = result.results
  } catch (err) {
    console.error('Error al obtener datos:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})

const documentosChartData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Cantidad de Documentos por Trámite',
        data: [],
        backgroundColor: isDark.value
          ? ['rgba(255, 255, 255, 0.8)', 'rgba(200, 200, 200, 0.8)', 'rgba(150, 150, 150, 0.8)']
          : ['rgba(54, 162, 235, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(255, 206, 86, 0.8)'],
        borderColor: isDark.value
          ? ['rgba(255, 255, 255, 1)', 'rgba(200, 200, 200, 1)', 'rgba(150, 150, 150, 1)']
          : ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    }
  }

  // Preparar datos para el gráfico
  const tramites = data.value.map(item => item.titulo)
  const cantidadDocumentos = data.value.map(item => item.documentos ? item.documentos.length : 0)

  // Generar colores dinámicamente
  const backgroundColors = isDark.value
    ? tramites.map((_, i) => `rgba(${255 - i * 20}, ${255 - i * 20}, ${255 - i * 20}, 0.8)`)
    : tramites.map((_, i) => `rgba(${54 + i * 20}, ${162 - i * 10}, ${235 - i * 15}, 0.8)`)

  const borderColors = isDark.value
    ? tramites.map((_, i) => `rgba(${255 - i * 20}, ${255 - i * 20}, ${255 - i * 20}, 1)`)
    : tramites.map((_, i) => `rgba(${54 + i * 20}, ${162 - i * 10}, ${235 - i * 15}, 1)`)

  return {
    labels: tramites,
    datasets: [{
      label: 'Cantidad de Documentos por Trámite',
      data: cantidadDocumentos,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }]
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: isDark.value ? 'white' : 'black'
        }
      },
      title: {
        display: true,
        text: 'Documentos por Trámite',
        color: isDark.value ? 'white' : 'black'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDark.value ? 'white' : 'black'
        }
      },
      x: {
        ticks: {
          color: isDark.value ? 'white' : 'black'
        }
      }
    }
  }
})
</script>

<template>
  <div v-if="isLoading">Cargando datos...</div>
  <div v-else-if="error">Error al cargar datos: {{ error }}</div>
  <div v-else>
    <div class="w-full max-w-4xl">
      <h3>Cantidad de Documentos por Trámite</h3>
      <Bar :data="documentosChartData" :options="chartOptions" :height="300" />
    </div>

    <h3>Listado de Trámites</h3>
    <table>
      <thead>
        <tr>
          <th>Título</th>
          <th>Bajada</th>
          <th>Cantidad de Documentos</th>
          <th>URL</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.titulo }}</td>
          <td>{{ item.bajada }}</td>
          <td>{{ item.documentos ? item.documentos.length : 0 }}</td>
          <td><a :href="item.url" target="_blank">{{ item.url }}</a></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
