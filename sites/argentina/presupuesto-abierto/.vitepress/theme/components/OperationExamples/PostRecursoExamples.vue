<script setup>
import { computed, ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const isDark = useData().isDark
const isLoading = ref(true)
const error = ref(null)
const data = ref({
  title: "Recursos por tipo",
  columns: [
    "tipo_desc",
    "clase_desc",
    "concepto_desc",
    "subconcepto_desc",
    "recurso_vigente",
    "recurso_ingresado_percibido"
  ],
  data: []
})

onMounted(async () => {
  try {
    const response = await fetch('https://www.presupuestoabierto.gob.ar/api/v1/recurso?format=json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '3c2aec3f-4c06-4d81-9803-d2449da79f3a'
      },
      body: JSON.stringify({
        ejercicios: [
          2025
        ],
        columns: [
          "tipo_desc",
          "clase_desc",
          "concepto_desc",
          "subconcepto_desc",
          "recurso_vigente",
          "recurso_ingresado_percibido"
        ],
        order: [
          {
            column: "recurso_ingresado_percibido",
            order: "desc"
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`)
    }

    const result = await response.json()
    data.value = result
  } catch (err) {
    console.error('Error al obtener datos:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})

const chartData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Monto',
        data: [],
        backgroundColor: isDark.value ? 'rgba(255, 255, 255, 0.8)' : 'rgba(54, 162, 235, 0.8)',
        borderColor: isDark.value ? 'rgba(255, 255, 255, 1)' : 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    }
  }

  // Agrupar por tipo y sumar los recursos
  const tiposMap = new Map()
  data.value.forEach(item => {
    const key = item.tipo_desc
    if (tiposMap.has(key)) {
      tiposMap.set(key, tiposMap.get(key) + item.recurso_ingresado_percibido)
    } else {
      tiposMap.set(key, item.recurso_ingresado_percibido)
    }
  })

  // Convertir el mapa a arrays para el gráfico
  const tipos = Array.from(tiposMap.keys())
  const montos = Array.from(tiposMap.values())

  // Colores para el gráfico
  const backgroundColors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)'
  ]

  const borderColors = isDark.value ?
    Array(tipos.length).fill('rgba(255, 255, 255, 1)') :
    [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)'
    ]

  return {
    labels: tipos,
    datasets: [
      {
        label: 'Monto Percibido',
        data: montos,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }
    ]
  }
})

const chartOptions = computed(() => {
  return {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribución de Recursos por Tipo (2025)',
        color: isDark.value ? 'white' : 'black'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: $${value.toLocaleString('es-AR')} (${percentage}%)`;
          }
        }
      }
    }
  }
})

// Calcular el total de recursos percibidos
const totalRecursos = computed(() => {
  if (!data.value || data.value.length === 0) {
    return 0
  }
  return data.value.reduce((acc, item) => acc + item.recurso_ingresado_percibido, 0)
})
</script>

<template>
  <div v-if="isLoading">Cargando datos...</div>
  <div v-else-if="error">Error al cargar datos: {{ error }}</div>
  <div v-else>
    <h3>Distribución de Recursos por Tipo (2025)</h3>

    <div class="w-full max-w-3xl">
      <Bar :data="chartData" :options="chartOptions" :height="300" />
    </div>

    <h3>Datos de Recursos</h3>
    <table>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Clase</th>
          <th>Concepto</th>
          <th>Subconcepto</th>
          <th>Recurso Vigente</th>
          <th>Recurso Percibido</th>
          <th>% del Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.tipo_desc }}</td>
          <td>{{ item.clase_desc }}</td>
          <td>{{ item.concepto_desc }}</td>
          <td>{{ item.subconcepto_desc }}</td>
          <td>${{ item.recurso_vigente ? item.recurso_vigente.toLocaleString('es-AR') : '0' }}</td>
          <td>${{ item.recurso_ingresado_percibido ? item.recurso_ingresado_percibido.toLocaleString('es-AR') : '0' }}</td>
          <td>{{ Math.round((item.recurso_ingresado_percibido / totalRecursos) * 100) }}%</td>
        </tr>
        <tr class="total">
          <td colspan="5"><strong>Total</strong></td>
          <td><strong>${{ totalRecursos.toLocaleString('es-AR') }}</strong></td>
          <td><strong>100%</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.total {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
