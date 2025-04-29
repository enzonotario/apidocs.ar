<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Legend, LinearScale, PointElement, Title, Tooltip } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useData } from 'vitepress'

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale, ChartDataLabels, zoomPlugin)

const isDark = useData().isDark

const provincias = ref([])
const selectedProvincia = ref('Salta')
const departamentos = ref([])

async function fetchProvincias() {
  const provData = await (await fetch('https://apis.datos.gob.ar/georef/api/provincias?orden=id&aplanar=true&campos=estandar&max=30&inicio=0&exacto=true&formato=json')).json()
  provincias.value = provData.provincias
}

async function fetchDepartamentos(provinciaNombre) {
  const depData = await (await fetch(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${encodeURIComponent(provinciaNombre)}&orden=id&aplanar=true&campos=completo&max=100&inicio=0&exacto=true&formato=json`)).json()
  departamentos.value = depData.departamentos
}

function getBounds(deps) {
  if (!deps.length) return { minLat: -34, maxLat: -30, minLon: -63, maxLon: -60 }
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity
  for (const d of deps) {
    if (d.centroide_lat < minLat) minLat = d.centroide_lat
    if (d.centroide_lat > maxLat) maxLat = d.centroide_lat
    if (d.centroide_lon < minLon) minLon = d.centroide_lon
    if (d.centroide_lon > maxLon) maxLon = d.centroide_lon
  }
  const padLat = (maxLat - minLat) * 0.1 || 0.1
  const padLon = (maxLon - minLon) * 0.1 || 0.1
  return {
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
    minLon: minLon - padLon,
    maxLon: maxLon + padLon
  }
}

const chartOptionsRef = ref({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          const d = context.raw
          return `${d.nombre}: (${d.y.toFixed(2)}, ${d.x.toFixed(2)})`
        }
      }
    },
    datalabels: {
      align: 'top',
      anchor: 'end',
      font: { size: 10 },
      formatter: function(value) {
        return value.nombre
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
      min: undefined,
      max: undefined
    },
    y: {
      title: { display: true, text: 'Latitud' },
      min: undefined,
      max: undefined
    }
  }
})

onMounted(async () => {
  await fetchProvincias()
})

watch(selectedProvincia, async (prov) => {
  if (prov) {
    await fetchDepartamentos(prov)
    await nextTick()
    const bounds = getBounds(departamentos.value)
    chartOptionsRef.value.scales.x.min = bounds.minLon
    chartOptionsRef.value.scales.x.max = bounds.maxLon
    chartOptionsRef.value.scales.y.min = bounds.minLat
    chartOptionsRef.value.scales.y.max = bounds.maxLat
  }
}, { immediate: true })

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Departamentos',
      data: departamentos.value.map(d => ({
        x: d.centroide_lon,
        y: d.centroide_lat,
        nombre: d.nombre_completo
      })),
      backgroundColor: isDark.value ? 'rgba(255,255,255,0.8)' : 'rgba(54,162,235,0.8)',
      pointRadius: 7,
      pointHoverRadius: 10
    }
  ]
}))
</script>

<template>
  <div class="relative">
    <div class="sticky bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-2 top-[var(--vp-nav-height)] z-10 rounded-b">
      <label>
        Provincia:
        <select v-model="selectedProvincia" class="w-full max-w-64 p-2 bg-muted dark:bg-muted">
          <option v-for="prov in provincias" :key="prov.id" :value="prov.nombre">
            {{ prov.nombre }}
          </option>
        </select>
      </label>
    </div>

    <h3>Distribución geográfica de Departamentos de {{ selectedProvincia }}</h3>
    <Scatter :data="chartData" :options="chartOptionsRef" :plugins="[ChartDataLabels, zoomPlugin]" :width="500" :height="400"/>

    <h3>Departamentos de {{ selectedProvincia }}</h3>
    <table>
      <thead>
      <tr>
        <th>Nombre completo</th>
        <th>Nombre</th>
        <th>Categoría</th>
        <th>Fuente</th>
        <th>Latitud</th>
        <th>Longitud</th>
        <th>Intersección prov.</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="dep in departamentos" :key="dep.id">
        <td>{{ dep.nombre_completo }}</td>
        <td>{{ dep.nombre }}</td>
        <td>{{ dep.categoria }}</td>
        <td>{{ dep.fuente }}</td>
        <td>{{ dep.centroide_lat.toFixed(4) }}</td>
        <td>{{ dep.centroide_lon.toFixed(4) }}</td>
        <td>{{ dep.provincia_interseccion.toFixed(4) }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
