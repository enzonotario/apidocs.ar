<script setup>
import { computed, ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useData } from 'vitepress'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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
  title: "Programación y ejecución física del primer trimestre",
  columns: [
    "ejercicio_presupuestario",
    "trimestre",
    "jurisdiccion_id",
    "jurisdiccion_desc",
    "subjurisdiccion_id",
    "subjurisdiccion_desc",
    "entidad_id",
    "entidad_desc",
    "servicio_id",
    "servicio_desc",
    "programa_id",
    "programa_desc",
    "subprograma_id",
    "subprograma_desc",
    "proyecto_id",
    "proyecto_desc",
    "actividad_id",
    "actividad_desc",
    "obra_id",
    "obra_desc",
    "finalidad_id",
    "finalidad_desc",
    "funcion_id",
    "funcion_desc",
    "tipo_medicion_fisica",
    "medicion_fisica_id",
    "medicion_fisica_desc",
    "unidad_medida_id",
    "unidad_medida_desc",
    "ubicacion_geografica_id",
    "ubicacion_geografica_desc",
    "totalizador_avance_fisico",
    "programacion_inicial_DA",
    "programacion_inicial_ajustada",
    "ejecutado_vigente_trim",
    "ejecutado_acumulado_trim",
    "causa_desvio",
    "causa_desvio_detalle",
    "ultima_actualizacion_fecha"
  ],
  data: []
})

onMounted(async () => {
  try {
    const response = await fetch('https://www.presupuestoabierto.gob.ar/api/v1/pef?format=json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '3c2aec3f-4c06-4d81-9803-d2449da79f3a'
      },
      body: JSON.stringify({
        title: "Programación y ejecución física del primer trimestre",
        columns: [
          "ejercicio_presupuestario",
          "trimestre",
          "jurisdiccion_id",
          "jurisdiccion_desc",
          "subjurisdiccion_id",
          "subjurisdiccion_desc",
          "entidad_id",
          "entidad_desc",
          "servicio_id",
          "servicio_desc",
          "programa_id",
          "programa_desc",
          "subprograma_id",
          "subprograma_desc",
          "proyecto_id",
          "proyecto_desc",
          "actividad_id",
          "actividad_desc",
          "obra_id",
          "obra_desc",
          "finalidad_id",
          "finalidad_desc",
          "funcion_id",
          "funcion_desc",
          "tipo_medicion_fisica",
          "medicion_fisica_id",
          "medicion_fisica_desc",
          "unidad_medida_id",
          "unidad_medida_desc",
          "ubicacion_geografica_id",
          "ubicacion_geografica_desc",
          "totalizador_avance_fisico",
          "programacion_inicial_DA",
          "programacion_inicial_ajustada",
          "ejecutado_vigente_trim",
          "ejecutado_acumulado_trim",
          "causa_desvio",
          "causa_desvio_detalle",
          "ultima_actualizacion_fecha"
        ],
        ejercicios: [
          2025
        ],
        filters: [
          {
            column: "trimestre",
            operator: "equal",
            value: "1"
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
      datasets: [
        {
          label: 'Programado',
          data: [],
          borderColor: isDark.value ? 'rgba(255, 255, 255, 1)' : 'rgba(54, 162, 235, 1)',
          backgroundColor: isDark.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(54, 162, 235, 0.2)',
          tension: 0.1
        },
        {
          label: 'Ejecutado',
          data: [],
          borderColor: isDark.value ? 'rgba(255, 206, 86, 1)' : 'rgba(255, 99, 132, 1)',
          backgroundColor: isDark.value ? 'rgba(255, 206, 86, 0.2)' : 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }
      ]
    }
  }

  // Agrupar por programa y calcular promedios de programación y ejecución
  const programasMap = new Map()

  data.value.forEach(item => {
    const key = item.programa_desc || 'Sin programa'
    if (!programasMap.has(key)) {
      programasMap.set(key, {
        programado: 0,
        ejecutado: 0,
        count: 0
      })
    }

    const entry = programasMap.get(key)
    if (item.programacion_inicial_ajustada) {
      entry.programado += item.programacion_inicial_ajustada
    }
    if (item.ejecutado_vigente_trim) {
      entry.ejecutado += item.ejecutado_vigente_trim
    }
    entry.count++
  })

  // Convertir el mapa a arrays para el gráfico
  const programas = Array.from(programasMap.keys())
  const programados = Array.from(programasMap.values()).map(v => v.programado / v.count)
  const ejecutados = Array.from(programasMap.values()).map(v => v.ejecutado / v.count)

  return {
    labels: programas,
    datasets: [
      {
        label: 'Programado',
        data: programados,
        borderColor: isDark.value ? 'rgba(255, 255, 255, 1)' : 'rgba(54, 162, 235, 1)',
        backgroundColor: isDark.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(54, 162, 235, 0.2)',
        tension: 0.1
      },
      {
        label: 'Ejecutado',
        data: ejecutados,
        borderColor: isDark.value ? 'rgba(255, 206, 86, 1)' : 'rgba(255, 99, 132, 1)',
        backgroundColor: isDark.value ? 'rgba(255, 206, 86, 0.2)' : 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      }
    ]
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Programación y Ejecución Física por Programa (Primer Trimestre 2025)',
        color: isDark.value ? 'white' : 'black'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad',
          color: isDark.value ? 'white' : 'black'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Programa',
          color: isDark.value ? 'white' : 'black'
        },
        ticks: {
          maxRotation: 90,
          minRotation: 45
        }
      }
    }
  }
})

// Calcular el porcentaje de ejecución
const getEjecucionPorcentaje = (programado, ejecutado) => {
  if (!programado || programado === 0) return 0;
  return Math.round((ejecutado / programado) * 100);
}
</script>

<template>
  <div v-if="isLoading">Cargando datos...</div>
  <div v-else-if="error">Error al cargar datos: {{ error }}</div>
  <div v-else>
    <h3>Programación y Ejecución Física por Programa (Primer Trimestre 2025)</h3>
    <Line :data="chartData" :options="chartOptions" :height="300" />

    <h3>Datos de Programación y Ejecución Física</h3>
    <table>
      <thead>
        <tr>
          <th>Ejercicio</th>
          <th>Trimestre</th>
          <th>Jurisdicción</th>
          <th>Programa</th>
          <th>Medición Física</th>
          <th>Unidad de Medida</th>
          <th>Programado</th>
          <th>Ejecutado</th>
          <th>% Ejecución</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.ejercicio_presupuestario }}</td>
          <td>{{ item.trimestre }}</td>
          <td>{{ item.jurisdiccion_desc }}</td>
          <td>{{ item.programa_desc }}</td>
          <td>{{ item.medicion_fisica_desc }}</td>
          <td>{{ item.unidad_medida_desc }}</td>
          <td>{{ item.programacion_inicial_ajustada }}</td>
          <td>{{ item.ejecutado_vigente_trim }}</td>
          <td>{{ getEjecucionPorcentaje(item.programacion_inicial_ajustada, item.ejecutado_vigente_trim) }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
