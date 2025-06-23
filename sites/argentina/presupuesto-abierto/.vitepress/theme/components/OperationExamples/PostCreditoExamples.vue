<script setup>
import { computed, ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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
  title: "Crédito vigente por finalidad función",
  columns: [
    "finalidad_id",
    "finalidad_desc",
    "funcion_id",
    "funcion_desc",
    "credito_vigente"
  ],
  data: []
})

onMounted(async () => {
  try {
    const response = await fetch('https://www.presupuestoabierto.gob.ar/api/v1/credito?format=json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '3c2aec3f-4c06-4d81-9803-d2449da79f3a'
      },
      body: JSON.stringify({
        title: "Crédito vigente por finalidad función",
        columns: [
          "finalidad_id",
          "finalidad_desc",
          "funcion_id",
          "funcion_desc",
          "credito_vigente"
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
        label: 'Crédito Vigente',
        data: [],
        backgroundColor: isDark.value ? 'rgba(255, 255, 255, 0.8)' : 'rgba(54, 162, 235, 0.8)',
        borderColor: isDark.value ? 'rgba(255, 255, 255, 1)' : 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    }
  }

  // Agrupar por finalidad y sumar los créditos
  const finalidadesMap = new Map()
  data.value.forEach(item => {
    const key = item.finalidad_desc
    if (finalidadesMap.has(key)) {
      finalidadesMap.set(key, finalidadesMap.get(key) + item.credito_vigente)
    } else {
      finalidadesMap.set(key, item.credito_vigente)
    }
  })

  // Convertir el mapa a arrays para el gráfico
  const finalidades = Array.from(finalidadesMap.keys())
  const montos = Array.from(finalidadesMap.values())

  return {
    labels: finalidades,
    datasets: [
      {
        label: 'Crédito Vigente',
        data: montos,
        backgroundColor: isDark.value ? 'rgba(255, 255, 255, 0.8)' : 'rgba(54, 162, 235, 0.8)',
        borderColor: isDark.value ? 'rgba(255, 255, 255, 1)' : 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Crédito Vigente por Finalidad',
        color: isDark.value ? 'white' : 'black'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `$${value.toLocaleString('es-AR')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString('es-AR');
          }
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
    <h3>Distribución de Crédito por Finalidad</h3>
    <Bar :data="chartData" :options="chartOptions" :height="200" />

    <h3>Datos de Crédito por Finalidad y Función</h3>
    <table>
      <thead>
        <tr>
          <th>Finalidad</th>
          <th>Función</th>
          <th>Crédito Vigente</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.finalidad_desc }}</td>
          <td>{{ item.funcion_desc }}</td>
          <td>${{ item.credito_vigente.toLocaleString('es-AR') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
