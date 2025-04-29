<script setup>
import { ref, watch, onMounted } from 'vue'
import { useData } from 'vitepress'

const isDark = useData().isDark

const provincias = ref([])
const selectedProvincia = ref('Salta')
const departamentos = ref([])
const selectedDepartamento = ref('General José de San Martín')
const localidadesCensales = ref([])
const selectedLocalidadCensal = ref('Tartagal')
const calles = ref([])

const perPage = 10
const currentPage = ref(1)
const totalPages = ref(1)
const totalCalles = ref(0)

async function fetchProvincias() {
  const provData = await (await fetch('https://apis.datos.gob.ar/georef/api/provincias?orden=id&aplanar=true&campos=estandar&max=30&inicio=0&exacto=true&formato=json')).json()
  provincias.value = provData.provincias
}

async function fetchDepartamentos(provinciaNombre) {
  const depData = await (await fetch(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${encodeURIComponent(provinciaNombre)}&orden=id&aplanar=true&campos=completo&max=100&inicio=0&exacto=true&formato=json`)).json()
  departamentos.value = depData.departamentos
  if (!departamentos.value.some(d => d.nombre === selectedDepartamento.value)) {
    selectedDepartamento.value = departamentos.value[0]?.nombre || ''
  }
}

async function fetchLocalidadesCensales(provinciaNombre, departamentoNombre) {
  const locCensalData = await (await fetch(`https://apis.datos.gob.ar/georef/api/localidades-censales?provincia=${encodeURIComponent(provinciaNombre)}&departamento=${encodeURIComponent(departamentoNombre)}&orden=id&aplanar=true&campos=completo&max=100&inicio=0&exacto=true&formato=json`)).json()
  localidadesCensales.value = locCensalData.localidades_censales
  if (!localidadesCensales.value.some(l => l.nombre === selectedLocalidadCensal.value)) {
    selectedLocalidadCensal.value = localidadesCensales.value[0]?.nombre || ''
  }
}

async function fetchCalles(page = 1) {
  if (!selectedProvincia.value || !selectedDepartamento.value || !selectedLocalidadCensal.value) {
    calles.value = []
    totalPages.value = 1
    totalCalles.value = 0
    return
  }
  const inicio = (page - 1) * perPage
  const url = `https://apis.datos.gob.ar/georef/api/calles?categoria=calle&provincia=${encodeURIComponent(selectedProvincia.value)}&departamento=${encodeURIComponent(selectedDepartamento.value)}&localidad_censal=${encodeURIComponent(selectedLocalidadCensal.value)}&orden=id&aplanar=true&campos=completo&max=${perPage}&inicio=${inicio}&exacto=true&formato=json`
  const data = await (await fetch(url)).json()
  calles.value = data.calles || []
  totalCalles.value = data.total || 0
  totalPages.value = Math.max(1, Math.ceil(totalCalles.value / perPage))
}

onMounted(async () => {
  await fetchProvincias()
})

watch(selectedProvincia, async (prov) => {
  if (prov) {
    currentPage.value = 1
    await fetchDepartamentos(prov)
  }
}, { immediate: true })

watch(selectedDepartamento, async (dep) => {
  if (selectedProvincia.value && dep) {
    currentPage.value = 1
    await fetchLocalidadesCensales(selectedProvincia.value, dep)
  }
}, { immediate: true })

watch(selectedLocalidadCensal, async (loc) => {
  if (selectedProvincia.value && selectedDepartamento.value && loc) {
    currentPage.value = 1
    await fetchCalles(currentPage.value)
  }
}, { immediate: true })

watch(currentPage, async (page) => {
  await fetchCalles(page)
})
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
      <label v-if="departamentos.length" class="flex flex-row items-center gap-2">
        Departamento:
        <select v-model="selectedDepartamento" class="w-full p-2 bg-muted dark:bg-muted">
          <option v-for="dep in departamentos" :key="dep.id" :value="dep.nombre">
            {{ dep.nombre }}
          </option>
        </select>
      </label>
      <label v-if="localidadesCensales.length" class="flex flex-row items-center gap-2">
        Localidad Censal:
        <select v-model="selectedLocalidadCensal" class="w-full p-2 bg-muted dark:bg-muted">
          <option v-for="loc in localidadesCensales" :key="loc.id" :value="loc.nombre">
            {{ loc.nombre }}
          </option>
        </select>
      </label>
    </div>

    <h3>Calles de {{ selectedLocalidadCensal }}, {{ selectedDepartamento }}, {{ selectedProvincia }}</h3>
    <table v-if="calles.length">
      <thead>
      <tr>
        <th>Nombre</th>
        <th>Nomenclatura</th>
        <th>Categoría</th>
        <th>Fuente</th>
        <th>Altura Inicio Izq</th>
        <th>Altura Inicio Der</th>
        <th>Altura Fin Izq</th>
        <th>Altura Fin Der</th>
        <th>Departamento</th>
        <th>Provincia</th>
        <th>Localidad Censal</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="c in calles" :key="c.id">
        <td>{{ c.nombre }}</td>
        <td>{{ c.nomenclatura }}</td>
        <td>{{ c.categoria }}</td>
        <td>{{ c.fuente }}</td>
        <td>{{ c.altura_inicio_izquierda }}</td>
        <td>{{ c.altura_inicio_derecha }}</td>
        <td>{{ c.altura_fin_izquierda }}</td>
        <td>{{ c.altura_fin_derecha }}</td>
        <td>{{ c.departamento_nombre }}</td>
        <td>{{ c.provincia_nombre }}</td>
        <td>{{ c.localidad_censal_nombre }}</td>
      </tr>
      </tbody>
    </table>
    <div v-else>No hay calles para la selección actual.</div>

    <div v-if="totalPages > 1" class="flex justify-end items-center gap-4 ">
      <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">
        Anterior
      </button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">
        Siguiente
      </button>
    </div>
  </div>
</template>
