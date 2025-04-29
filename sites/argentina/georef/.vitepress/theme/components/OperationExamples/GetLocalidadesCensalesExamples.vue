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
const municipios = ref([])
const selectedMunicipio = ref('Tartagal')
const localidadesCensales = ref([])

async function fetchProvincias() {
  const provData = await (await fetch('https://apis.datos.gob.ar/georef/api/provincias?orden=id&aplanar=true&campos=estandar&max=30&inicio=0&exacto=true&formato=json')).json()
  provincias.value = provData.provincias
}

async function fetchMunicipios(provinciaNombre) {
  const url = `https://apis.datos.gob.ar/georef/api/municipios?provincia=${encodeURIComponent(provinciaNombre)}&orden=id&aplanar=true&campos=completo&max=100&inicio=0&exacto=true&formato=json`
  const data = await (await fetch(url)).json()
  municipios.value = data.municipios

  if (!selectedMunicipio.value || !municipios.value.some(m => m.nombre === selectedMunicipio.value)) {
    selectedMunicipio.value = municipios.value[0]?.nombre
  }
}

async function fetchLocalidadesCensales(provinciaNombre, municipioNombre) {
  const url = `https://apis.datos.gob.ar/georef/api/localidades-censales?provincia=${encodeURIComponent(provinciaNombre)}&municipio=${encodeURIComponent(municipioNombre)}&orden=id&aplanar=true&campos=completo&max=1000&inicio=0&exacto=true&formato=json`
  const data = await (await fetch(url)).json()
  localidadesCensales.value = data.localidades_censales
}

function getBounds(items, latKey = 'centroide_lat', lonKey = 'centroide_lon') {
  if (!items.length) return { minLat: -34, maxLat: -30, minLon: -63, maxLon: -60 }
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity
  for (const m of items) {
    if (m[latKey] < minLat) minLat = m[latKey]
    if (m[latKey] > maxLat) maxLat = m[latKey]
    if (m[lonKey] < minLon) minLon = m[lonKey]
    if (m[lonKey] > maxLon) maxLon = m[lonKey]
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
      pan: { enabled: true, mode: 'xy', modifierKey: null },
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy'
      }
    }
  },
  scales: {
    x: { title: { display: true, text: 'Longitud' }, min: undefined, max: undefined },
    y: { title: { display: true, text: 'Latitud' }, min: undefined, max: undefined }
  }
})

const chartOptionsLocalidades = ref(JSON.parse(JSON.stringify(chartOptionsRef.value)))

onMounted(async () => {
  await fetchProvincias()
})

watch(selectedProvincia, async (prov) => {
  if (prov) {
    await fetchMunicipios(selectedProvincia.value)
  }
}, { immediate: true })

watch(selectedMunicipio, async (mun) => {
  if (selectedProvincia.value && mun) {
    await fetchLocalidadesCensales(selectedProvincia.value, mun)
    await nextTick()
    const bounds = getBounds(localidadesCensales.value)
    chartOptionsLocalidades.value.scales.x.min = bounds.minLon
    chartOptionsLocalidades.value.scales.x.max = bounds.maxLon
    chartOptionsLocalidades.value.scales.y.min = bounds.minLat
    chartOptionsLocalidades.value.scales.y.max = bounds.maxLat
  }
}, { immediate: true })

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Municipios',
      data: municipios.value.map(m => ({
        x: m.centroide_lon,
        y: m.centroide_lat,
        nombre: m.nombre_completo
      })),
      backgroundColor: isDark.value ? 'rgba(255,255,255,0.8)' : 'rgba(54,162,235,0.8)',
      pointRadius: 7,
      pointHoverRadius: 10
    }
  ]
}))

const chartDataLocalidades = computed(() => ({
  datasets: [
    {
      label: 'Localidades Censales',
      data: localidadesCensales.value.map(l => ({
        x: l.centroide_lon,
        y: l.centroide_lat,
        nombre: l.nombre
      })),
      backgroundColor: isDark.value ? 'rgba(255,255,255,0.8)' : 'rgba(255,99,132,0.8)',
      pointRadius: 9,
      pointHoverRadius: 12
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
      <label v-if="municipios?.length" class="ml-4">
        Municipio:
        <select v-model="selectedMunicipio" class="w-full max-w-64 p-2 bg-muted dark:bg-muted">
          <option v-for="mun in municipios" :key="mun.id" :value="mun.nombre">
            {{ mun.nombre }}
          </option>
        </select>
      </label>
    </div>

    <h3 class="mt-6">Distribución geográfica de Localidades Censales de {{ selectedMunicipio }}, {{ selectedProvincia }}</h3>
    <Scatter :data="chartDataLocalidades" :options="chartOptionsLocalidades" :plugins="[ChartDataLabels, zoomPlugin]" :width="500" :height="400"/>

    <h3>Localidades Censales</h3>
    <table>
      <thead>
      <tr>
        <th>Nombre</th>
        <th>Categoría</th>
        <th>Fuente</th>
        <th>Latitud</th>
        <th>Longitud</th>
        <th>Departamento</th>
        <th>Municipio</th>
        <th>Provincia</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="loc in localidadesCensales" :key="loc.id">
        <td>{{ loc.nombre }}</td>
        <td>{{ loc.categoria }}</td>
        <td>{{ loc.fuente }}</td>
        <td>{{ loc.centroide_lat?.toFixed(4) }}</td>
        <td>{{ loc.centroide_lon?.toFixed(4) }}</td>
        <td>{{ loc.departamento_nombre }}</td>
        <td>{{ loc.municipio_nombre }}</td>
        <td>{{ loc.provincia_nombre }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
