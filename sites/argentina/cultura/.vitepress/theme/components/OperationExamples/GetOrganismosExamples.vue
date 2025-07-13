<script setup>
import { computed, ref, onMounted } from 'vue'
import { Bar, Pie } from 'vue-chartjs'
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
    const response = await fetch('https://www.cultura.gob.ar/api/v2.0/organismos/?format=json')

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

const dependenciaChartData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Organismos por Dependencia',
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

  // Agrupar por dependencia
  const dependenciasMap = new Map()
  data.value.forEach(item => {
    const key = item.depende_de || 'Sin dependencia'
    if (dependenciasMap.has(key)) {
      dependenciasMap.set(key, dependenciasMap.get(key) + 1)
    } else {
      dependenciasMap.set(key, 1)
    }
  })

  // Convertir el mapa a arrays para el gráfico
  const dependencias = Array.from(dependenciasMap.keys())
  const cantidades = Array.from(dependenciasMap.values())

  // Generar colores dinámicamente
  const backgroundColors = isDark.value
    ? dependencias.map((_, i) => `rgba(${255 - i * 30}, ${255 - i * 30}, ${255 - i * 30}, 0.8)`)
    : dependencias.map((_, i) => `rgba(${54 + i * 30}, ${162 - i * 10}, ${235 - i * 20}, 0.8)`)

  const borderColors = isDark.value
    ? dependencias.map((_, i) => `rgba(${255 - i * 30}, ${255 - i * 30}, ${255 - i * 30}, 1)`)
    : dependencias.map((_, i) => `rgba(${54 + i * 30}, ${162 - i * 10}, ${235 - i * 20}, 1)`)

  return {
    labels: dependencias,
    datasets: [{
      label: 'Organismos por Dependencia',
      data: cantidades,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }]
  }
})

const provinciaChartData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Organismos por Provincia',
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

  // Agrupar por provincia
  const provinciasMap = new Map()
  data.value.forEach(item => {
    const key = item.provincia || 'Sin provincia'
    if (provinciasMap.has(key)) {
      provinciasMap.set(key, provinciasMap.get(key) + 1)
    } else {
      provinciasMap.set(key, 1)
    }
  })

  // Convertir el mapa a arrays para el gráfico
  const provincias = Array.from(provinciasMap.keys())
  const cantidades = Array.from(provinciasMap.values())

  // Generar colores dinámicamente
  const backgroundColors = isDark.value
    ? provincias.map((_, i) => `rgba(${255 - i * 20}, ${255 - i * 20}, ${255 - i * 20}, 0.8)`)
    : provincias.map((_, i) => `rgba(${54 + i * 20}, ${162 - i * 10}, ${235 - i * 15}, 0.8)`)

  const borderColors = isDark.value
    ? provincias.map((_, i) => `rgba(${255 - i * 20}, ${255 - i * 20}, ${255 - i * 20}, 1)`)
    : provincias.map((_, i) => `rgba(${54 + i * 20}, ${162 - i * 10}, ${235 - i * 15}, 1)`)

  return {
    labels: provincias,
    datasets: [{
      label: 'Organismos por Provincia',
      data: cantidades,
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
        text: 'Distribución de Organismos',
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

const pieChartOptions = computed(() => {
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
        text: 'Distribución de Organismos por Provincia',
        color: isDark.value ? 'white' : 'black'
      }
    }
  }
})
</script>

<template>
  <div v-if="isLoading">Cargando datos...</div>
  <div v-else-if="error">Error al cargar datos: {{ error }}</div>
  <div v-else>
    <div class="w-full max-w-2xl">
      <h3>Distribución de Organismos por Dependencia</h3>
      <Bar :data="dependenciaChartData" :options="chartOptions" :height="300" />
    </div>

    <div class="w-full max-w-md">
      <h3>Distribución de Organismos por Provincia</h3>
      <Pie :data="provinciaChartData" :options="pieChartOptions" :height="300" />
    </div>

    <h3>Listado de Organismos</h3>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Dependencia</th>
          <th>Provincia</th>
          <th>Dirección</th>
          <th>Teléfono</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.nombre }}</td>
          <td>{{ item.depende_de || 'Sin dependencia' }}</td>
          <td>{{ item.provincia || 'Sin provincia' }}</td>
          <td>{{ item.direccion || 'Sin dirección' }}</td>
          <td>{{ item.telefono || 'Sin teléfono' }}</td>
          <td>{{ item.email || 'Sin email' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
