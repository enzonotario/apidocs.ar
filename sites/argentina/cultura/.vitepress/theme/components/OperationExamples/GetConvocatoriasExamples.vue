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
    const response = await fetch('https://www.cultura.gob.ar/api/v2.0/convocatorias/?format=json')

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

// Gráfico de distribución por estado (abierta/cerrada)
const estadoChartData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Convocatorias por Estado',
        data: [],
        backgroundColor: isDark.value
          ? ['rgba(255, 255, 255, 0.8)', 'rgba(200, 200, 200, 0.8)']
          : ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: isDark.value
          ? ['rgba(255, 255, 255, 1)', 'rgba(200, 200, 200, 1)']
          : ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }]
    }
  }

  // Agrupar por estado
  const estadosMap = new Map()
  data.value.forEach(item => {
    const estado = item.estado || 'No especificado'
    if (estadosMap.has(estado)) {
      estadosMap.set(estado, estadosMap.get(estado) + 1)
    } else {
      estadosMap.set(estado, 1)
    }
  })

  // Convertir el mapa a arrays para el gráfico
  const estados = Array.from(estadosMap.keys())
  const cantidades = Array.from(estadosMap.values())

  // Generar colores específicos para cada estado
  const backgroundColors = estados.map(estado => {
    if (estado.toLowerCase() === 'abierta') {
      return isDark.value ? 'rgba(100, 255, 100, 0.8)' : 'rgba(75, 192, 75, 0.8)'
    } else if (estado.toLowerCase() === 'cerrada') {
      return isDark.value ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 99, 132, 0.8)'
    } else {
      return isDark.value ? 'rgba(200, 200, 200, 0.8)' : 'rgba(201, 203, 207, 0.8)'
    }
  })

  const borderColors = estados.map(estado => {
    if (estado.toLowerCase() === 'abierta') {
      return isDark.value ? 'rgba(100, 255, 100, 1)' : 'rgba(75, 192, 75, 1)'
    } else if (estado.toLowerCase() === 'cerrada') {
      return isDark.value ? 'rgba(255, 100, 100, 1)' : 'rgba(255, 99, 132, 1)'
    } else {
      return isDark.value ? 'rgba(200, 200, 200, 1)' : 'rgba(201, 203, 207, 1)'
    }
  })

  return {
    labels: estados,
    datasets: [{
      label: 'Convocatorias por Estado',
      data: cantidades,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }]
  }
})

// Gráfico de distribución por mes de finalización
const fechaFinChartData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Convocatorias por Mes de Finalización',
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

  // Agrupar por mes y año de finalización
  const fechasMap = new Map()
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  data.value.forEach(item => {
    if (item.fecha_fin) {
      const fecha = new Date(item.fecha_fin)
      const mes = fecha.getMonth()
      const año = fecha.getFullYear()
      const key = `${meses[mes]} ${año}`

      if (fechasMap.has(key)) {
        fechasMap.set(key, fechasMap.get(key) + 1)
      } else {
        fechasMap.set(key, 1)
      }
    }
  })

  // Ordenar las fechas cronológicamente
  const fechasOrdenadas = Array.from(fechasMap.entries())
    .sort((a, b) => {
      const [mesA, añoA] = a[0].split(' ')
      const [mesB, añoB] = b[0].split(' ')

      if (añoA !== añoB) {
        return parseInt(añoA) - parseInt(añoB)
      }

      return meses.indexOf(mesA) - meses.indexOf(mesB)
    })

  const labels = fechasOrdenadas.map(entry => entry[0])
  const cantidades = fechasOrdenadas.map(entry => entry[1])

  // Generar colores dinámicamente
  const backgroundColors = isDark.value
    ? labels.map((_, i) => `rgba(${255 - i * 15}, ${255 - i * 15}, ${255 - i * 15}, 0.8)`)
    : labels.map((_, i) => `rgba(${54 + i * 15}, ${162 - i * 8}, ${235 - i * 12}, 0.8)`)

  const borderColors = isDark.value
    ? labels.map((_, i) => `rgba(${255 - i * 15}, ${255 - i * 15}, ${255 - i * 15}, 1)`)
    : labels.map((_, i) => `rgba(${54 + i * 15}, ${162 - i * 8}, ${235 - i * 12}, 1)`)

  return {
    labels: labels,
    datasets: [{
      label: 'Convocatorias por Mes de Finalización',
      data: cantidades,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }]
  }
})

// Gráfico de duración de convocatorias (en días)
const duracionChartData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Duración de Convocatorias (en días)',
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

  // Calcular duración en días para cada convocatoria
  const convocatoriasConDuracion = data.value
    .filter(item => item.fecha_inicio && item.fecha_fin)
    .map(item => {
      const inicio = new Date(item.fecha_inicio)
      const fin = new Date(item.fecha_fin)
      const duracionDias = Math.round((fin - inicio) / (1000 * 60 * 60 * 24))

      return {
        titulo: item.titulo,
        duracionDias
      }
    })
    .sort((a, b) => a.duracionDias - b.duracionDias)

  const titulos = convocatoriasConDuracion.map(item => item.titulo)
  const duraciones = convocatoriasConDuracion.map(item => item.duracionDias)

  // Generar colores dinámicamente
  const backgroundColors = isDark.value
    ? titulos.map((_, i) => `rgba(${255 - i * 10}, ${255 - i * 10}, ${255 - i * 10}, 0.8)`)
    : titulos.map((_, i) => `rgba(${54 + i * 10}, ${162 - i * 5}, ${235 - i * 8}, 0.8)`)

  const borderColors = isDark.value
    ? titulos.map((_, i) => `rgba(${255 - i * 10}, ${255 - i * 10}, ${255 - i * 10}, 1)`)
    : titulos.map((_, i) => `rgba(${54 + i * 10}, ${162 - i * 5}, ${235 - i * 8}, 1)`)

  return {
    labels: titulos,
    datasets: [{
      label: 'Duración (días)',
      data: duraciones,
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
        text: 'Distribución de Convocatorias',
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
        text: 'Distribución de Convocatorias por Estado',
        color: isDark.value ? 'white' : 'black'
      }
    }
  }
})

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'No especificada'

  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Función para truncar texto largo
const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + '...'
}
</script>

<template>
  <div v-if="isLoading">Cargando datos...</div>
  <div v-else-if="error">Error al cargar datos: {{ error }}</div>
  <div v-else>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div>
        <h3>Distribución de Convocatorias por Estado</h3>
        <Pie :data="estadoChartData" :options="pieChartOptions" :height="300" />
      </div>
      <div>
        <h3>Convocatorias por Mes de Finalización</h3>
        <Bar :data="fechaFinChartData" :options="chartOptions" :height="300" />
      </div>
    </div>

    <h3>Duración de Convocatorias (en días)</h3>
    <Bar :data="duracionChartData" :options="chartOptions" :height="300" />

    <h3>Listado de Convocatorias</h3>
    <table>
      <thead>
        <tr>
          <th>Título</th>
          <th>Estado</th>
          <th>Fecha Inicio</th>
          <th>Fecha Fin</th>
          <th>Duración (días)</th>
          <th>Documentos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>
            <a :href="item.link" target="_blank" :title="item.titulo">
              {{ truncateText(item.titulo) }}
            </a>
          </td>
          <td>
            <span :class="item.estado === 'abierta' ? 'text-green-500' : 'text-red-500'">
              {{ item.estado || 'No especificado' }}
            </span>
          </td>
          <td>{{ formatDate(item.fecha_inicio) }}</td>
          <td>{{ formatDate(item.fecha_fin) }}</td>
          <td>
            {{ item.fecha_inicio && item.fecha_fin
              ? Math.round((new Date(item.fecha_fin) - new Date(item.fecha_inicio)) / (1000 * 60 * 60 * 24))
              : 'N/A' }}
          </td>
          <td>{{ item.documentos ? item.documentos.length : 0 }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
