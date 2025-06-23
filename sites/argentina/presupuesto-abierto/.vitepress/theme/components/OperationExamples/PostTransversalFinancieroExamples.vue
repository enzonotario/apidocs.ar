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
  title: "Análisis transversal financiero con etiqueta de Niñez y Adolescencia",
  columns: [
    "etiqueta_id",
    "etiqueta_desc",
    "credito_inicial_ponderado",
    "credito_vigente_ponderado",
    "credito_ejecutado_ponderado"
  ],
  data: []
})

onMounted(async () => {
  try {
    const response = await fetch('https://www.presupuestoabierto.gob.ar/api/v1/transversal_financiero?format=json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '3c2aec3f-4c06-4d81-9803-d2449da79f3a'
      },
      body: JSON.stringify({
        title: "Análisis transversal financiero con etiqueta de Niñez y Adolescencia",
        columns: [
          "etiqueta_id",
          "etiqueta_desc",
          "credito_inicial_ponderado",
          "credito_vigente_ponderado",
          "credito_ejecutado_ponderado"
        ],
        ejercicios: [
          2024
        ],
        filters: [
          {
            column: "etiqueta_id",
            operator: "equal",
            value: "02.00.00.00"
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
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: isDark.value ?
          ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)'] :
          ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    }
  }

  // Preparar datos para el gráfico
  return {
    labels: ['Crédito Inicial', 'Crédito Vigente', 'Crédito Ejecutado'],
    datasets: [
      {
        label: 'Montos Ponderados',
        data: [
          data.value[0]?.credito_inicial_ponderado || 0,
          data.value[0]?.credito_vigente_ponderado || 0,
          data.value[0]?.credito_ejecutado_ponderado || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: isDark.value ?
          ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)'] :
          ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
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
        text: 'Análisis Transversal Financiero - Niñez y Adolescencia (2024)',
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

// Calcular el total
const total = computed(() => {
  if (!data.value || data.value.length === 0) {
    return 0
  }

  const item = data.value[0]
  if (!item) return 0

  return (item.credito_inicial_ponderado || 0) +
         (item.credito_vigente_ponderado || 0) +
         (item.credito_ejecutado_ponderado || 0)
})
</script>

<template>
  <div v-if="isLoading">Cargando datos...</div>
  <div v-else-if="error">Error al cargar datos: {{ error }}</div>
  <div v-else>
    <h3>Análisis Transversal Financiero - Niñez y Adolescencia (2024)</h3>

    <div class="w-full max-w-xl">
      <Bar :data="chartData" :options="chartOptions" :height="300" />
    </div>

    <h3>Datos de Análisis Transversal Financiero</h3>
    <table>
      <thead>
        <tr>
          <th>Etiqueta ID</th>
          <th>Etiqueta</th>
          <th>Crédito Inicial</th>
          <th>Crédito Vigente</th>
          <th>Crédito Ejecutado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.etiqueta_id }}</td>
          <td>{{ item.etiqueta_desc }}</td>
          <td>${{ item.credito_inicial_ponderado ? item.credito_inicial_ponderado.toLocaleString('es-AR') : '0' }}</td>
          <td>${{ item.credito_vigente_ponderado ? item.credito_vigente_ponderado.toLocaleString('es-AR') : '0' }}</td>
          <td>${{ item.credito_ejecutado_ponderado ? item.credito_ejecutado_ponderado.toLocaleString('es-AR') : '0' }}</td>
        </tr>
      </tbody>
    </table>

    <h3>Porcentajes de Ejecución</h3>
    <table>
      <thead>
        <tr>
          <th>Etiqueta</th>
          <th>% Ejecución sobre Crédito Inicial</th>
          <th>% Ejecución sobre Crédito Vigente</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.etiqueta_desc }}</td>
          <td>{{ item.credito_inicial_ponderado ? Math.round((item.credito_ejecutado_ponderado / item.credito_inicial_ponderado) * 100) : 0 }}%</td>
          <td>{{ item.credito_vigente_ponderado ? Math.round((item.credito_ejecutado_ponderado / item.credito_vigente_ponderado) * 100) : 0 }}%</td>
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
