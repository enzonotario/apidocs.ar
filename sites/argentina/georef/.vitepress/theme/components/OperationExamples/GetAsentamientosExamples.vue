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
const selectedLocalidadCensal = ref('Tartagal')
const asentamientos = ref([])

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
  if (!selectedLocalidadCensal.value || !localidadesCensales.value.some(l => l.nombre === selectedLocalidadCensal.value)) {
    selectedLocalidadCensal.value = localidadesCensales.value[0]?.nombre
  }
}

async function fetchAsentamientos(provincia, municipio, localidadCensal) {
  if (!provincia || !municipio || !localidadCensal) {
    asentamientos.value = []
    return
  }
  const url = `https://apis.datos.gob.ar/georef/api/asentamientos?provincia=${encodeURIComponent(provincia)}&municipio=${encodeURIComponent(municipio)}&localidad_censal=${encodeURIComponent(localidadCensal)}&orden=id&aplanar=true&campos=completo&max=10&inicio=0&exacto=true&formato=json`
  const data = await (await fetch(url)).json()
  asentamientos.value = data.asentamientos || []
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

const chartOptionsAsentamientos = ref({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          const d = context.raw
          return `${d.nombre}: (${d.y?.toFixed(4)}, ${d.x?.toFixed(4)})`
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

const chartDataAsentamientos = computed(() => ({
  datasets: [
    {
      label: 'Asentamientos',
      data: asentamientos.value.map(a => ({
        x: a.centroide_lon,
        y: a.centroide_lat,
        nombre: a.nombre
      })),
      backgroundColor: isDark.value ? 'rgba(255,255,255,0.8)' : 'rgba(255,206,86,0.8)',
      pointRadius: 10,
      pointHoverRadius: 13
    }
  ]
}))

onMounted(async () => {
  await fetchProvincias()
})

watch(selectedProvincia, async (prov) => {
  if (prov) {
    await fetchMunicipios(prov)
  }
}, { immediate: true })

watch(selectedMunicipio, async (mun) => {
  if (selectedProvincia.value && mun) {
    await fetchLocalidadesCensales(selectedProvincia.value, mun)
  }
}, { immediate: true })

watch(selectedLocalidadCensal, async (loc) => {
  if (selectedProvincia.value && selectedMunicipio.value && loc) {
    await fetchAsentamientos(selectedProvincia.value, selectedMunicipio.value, loc)
    await nextTick()
    const bounds = getBounds(asentamientos.value)
    chartOptionsAsentamientos.value.scales.x.min = bounds.minLon
    chartOptionsAsentamientos.value.scales.x.max = bounds.maxLon
    chartOptionsAsentamientos.value.scales.y.min = bounds.minLat
    chartOptionsAsentamientos.value.scales.y.max = bounds.maxLat
  }
}, { immediate: true })
</script>

<template>
  <div class="relative">
    <div class="sticky bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-2 top-[var(--vp-nav-height)] z-10 rounded-b grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      <label class="flex flex-row items-center gap-2">
        Provincia:
        <select v-model="selectedProvincia" class="w-full p-2 bg-muted dark:bg-muted">
          <option v-for="prov in provincias" :key="prov.id" :value="prov.nombre">
            {{ prov.nombre }}
          </option>
        </select>
      </label>
      <label v-if="municipios?.length" class="flex flex-row items-center gap-2">
        Municipio:
        <select v-model="selectedMunicipio" class="w-full p-2 bg-muted dark:bg-muted">
          <option v-for="mun in municipios" :key="mun.id" :value="mun.nombre">
            {{ mun.nombre }}
          </option>
        </select>
      </label>
      <label v-if="localidadesCensales?.length" class="flex flex-row items-center gap-2">
        Localidad Censal:
        <select v-model="selectedLocalidadCensal" class="w-full p-2 bg-muted dark:bg-muted">
          <option v-for="loc in localidadesCensales" :key="loc.id" :value="loc.nombre">
            {{ loc.nombre }}
          </option>
        </select>
      </label>
    </div>

    <h3 class="mt-6">Distribución geográfica de Asentamientos de {{ selectedLocalidadCensal }}, {{ selectedMunicipio }}, {{ selectedProvincia }}</h3>
    <Scatter :data="chartDataAsentamientos" :options="chartOptionsAsentamientos" :plugins="[ChartDataLabels, zoomPlugin]" :width="500" :height="400"/>

    <h3>Asentamientos</h3>
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
        <th>Localidad Censal</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="a in asentamientos" :key="a.id">
        <td>{{ a.nombre }}</td>
        <td>{{ a.categoria }}</td>
        <td>{{ a.fuente }}</td>
        <td>{{ a.centroide_lat?.toFixed(4) }}</td>
        <td>{{ a.centroide_lon?.toFixed(4) }}</td>
        <td>{{ a.departamento_nombre }}</td>
        <td>{{ a.municipio_nombre }}</td>
        <td>{{ a.provincia_nombre }}</td>
        <td>{{ a.localidad_censal_nombre }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
