<script setup>
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Legend, LinearScale, PointElement, Title, Tooltip } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useData } from 'vitepress'

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale, ChartDataLabels, zoomPlugin)

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const isDark = useData().isDark

const data = await (await fetch('https://apis.datos.gob.ar/georef/api/provincias?orden=id&aplanar=true&campos=completo&max=30&inicio=0&exacto=true&formato=json')).json()

const chartData = computed(() => {
  return {
    datasets: [
      {
        label: 'Provincias',
        data: data.provincias.map(p => ({
          x: p.centroide_lon,
          y: p.centroide_lat,
          nombre: p.nombre,
          nombre_completo: p.nombre_completo
        })),
        backgroundColor: isDark.value ? 'rgba(255, 255, 255, 0.8)' : 'rgba(54,162,235,0.8)',
        pointRadius: 7,
        pointHoverRadius: 10
      }
    ]
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const d = context.raw
            return `${d.nombre_completo}: (${d.y.toFixed(2)}, ${d.x.toFixed(2)})`
          }
        }
      },
      datalabels: {
        align: 'top',
        anchor: 'end',
        font: { size: 10 },
        formatter: function(value) {
          return value.nombre_completo
        },
        color: isDark.value ? 'white' : 'black'
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
          modifierKey: null
        },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: 'xy'
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Longitud' },
        min: -90,
        max: -20
      },
      y: {
        title: { display: true, text: 'Latitud' },
        min: -90,
        max: -10
      }
    }
  }
})
</script>

<template>
  <h3>Distribución geográfica</h3>
  <Scatter :data="chartData" :options="chartOptions" :plugins="[ChartDataLabels, zoomPlugin]" :width="500" :height="400"/>

  <h3>Provincias de Argentina</h3>
  <table>
    <thead>
    <tr>
      <th>Nombre</th>
      <th>Nombre Completo</th>
      <th>Categoría</th>
      <th>Latitud</th>
      <th>Longitud</th>
      <th>ISO Nombre</th>
      <th>Fuente</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="prov in data.provincias" :key="prov.id">
      <td>{{ prov.nombre }}</td>
      <td>{{ prov.nombre_completo }}</td>
      <td>{{ prov.categoria }}</td>
      <td>{{ prov.centroide_lat.toFixed(2) }}</td>
      <td>{{ prov.centroide_lon.toFixed(2) }}</td>
      <td>{{ prov.iso_nombre }}</td>
      <td>{{ prov.fuente }}</td>
    </tr>
    </tbody>
  </table>
</template>
