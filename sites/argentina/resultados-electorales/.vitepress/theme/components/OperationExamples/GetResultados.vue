<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Bar, Pie, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useData } from 'vitepress'
import colors from 'tailwind-colors';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement, ChartDataLabels)

const isDark = useData().isDark

const anioEleccion = ref('2023')
const tipoRecuento = ref('1')
const tipoEleccion = ref('1')
const categoriaId = ref('1')
const distritoId = ref('')
const seccionProvincialId = ref('')
const seccionId = ref('')
const circuitoId = ref('')
const mesaId = ref('')

const loading = ref(false)
const error = ref(null)
const resultados = ref(null)

async function fetchResultados() {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    if (anioEleccion.value) params.append('anioEleccion', anioEleccion.value)
    if (tipoRecuento.value) params.append('tipoRecuento', tipoRecuento.value)
    if (tipoEleccion.value) params.append('tipoEleccion', tipoEleccion.value)
    if (categoriaId.value) params.append('categoriaId', categoriaId.value)
    if (distritoId.value) params.append('distritoId', distritoId.value)
    if (seccionProvincialId.value) params.append('seccionProvincialId', seccionProvincialId.value)
    if (seccionId.value) params.append('seccionId', seccionId.value)
    if (circuitoId.value) params.append('circuitoId', circuitoId.value)
    if (mesaId.value) params.append('mesaId', mesaId.value)

    const url = `https://resultados.mininterior.gob.ar/api/resultados/getResultados?${params.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    resultados.value = data
  } catch (e) {
    error.value = e.message || 'Error al obtener resultados'
  } finally {
    loading.value = false
  }
}

const chartOptionsBar = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.raw.toLocaleString()} votos (${context.dataset.percentages[context.dataIndex]}%)`
        }
      }
    },
    datalabels: {
      color: isDark.value ? 'white' : 'black',
      font: { weight: 'bold' },
      formatter: function(value, context) {
        return `${value.toLocaleString()} (${context.dataset.percentages[context.dataIndex]}%)`
      },
      anchor: 'end',
      align: 'end'
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Votos'
      }
    }
  }
}))

const chartDataBar = computed(() => {
  if (!resultados.value?.valoresTotalizadosPositivos) {
    return { labels: [], datasets: [] }
  }

  const totales = resultados.value.valoresTotalizadosPositivos
      .sort((a, b) => b.votos - a.votos)

  const labels = totales.map(v => v.nombreAgrupacion)
  const data = totales.map(v => v.votos)
  const percentages = totales.map(v => v.votosPorcentaje.toFixed(1))

  return {
    labels,
    datasets: [
      {
        data,
        percentages,
        backgroundColor: [
          colors.indigo[500],
          colors.blue[500],
          colors.teal[500],
          colors.yellow[500],
          colors.orange[500],
          colors.red[500],
          colors.purple[500],
          colors.pink[500],
        ]
      }
    ]
  }
})

const chartOptionsPie = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.label}: ${context.raw.toLocaleString()} votos (${context.dataset.percentages[context.dataIndex]}%)`
        }
      }
    },
    datalabels: {
      color: 'white',
      font: { weight: 'bold' },
      formatter: function(value, context) {
        return context.dataset.percentages[context.dataIndex] + '%'
      }
    }
  }
}))

const chartDataPie = computed(() => {
  if (!resultados.value?.valoresTotalizadosPositivos) return { labels: [], datasets: [] }

  const labels = resultados.value.valoresTotalizadosPositivos.map(v => v.nombreAgrupacion)
  const data = resultados.value.valoresTotalizadosPositivos.map(v => v.votos)
  const percentages = resultados.value.valoresTotalizadosPositivos.map(v => v.votosPorcentaje.toFixed(1))

  return {
    labels,
    datasets: [
      {
        data,
        percentages,
        backgroundColor: [
          colors.indigo[500],
          colors.blue[500],
          colors.teal[500],
          colors.yellow[500],
          colors.orange[500],
          colors.red[500],
          colors.purple[500],
          colors.pink[500],
        ],
        borderColor: isDark.value ? colors.gray[800] : colors.gray[200],
      }
    ]
  }
})

const chartOptionsOtros = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.label}: ${context.raw.toLocaleString()} votos (${context.dataset.percentages[context.dataIndex]}%)`
        }
      }
    },
    datalabels: {
      color: isDark.value ? 'white' : 'black',
      font: { weight: 'bold' },
      formatter: function(value, context) {
        return context.dataset.percentages[context.dataIndex] + '%'
      }
    }
  }
}))

const chartDataOtros = computed(() => {
  if (!resultados.value?.valoresTotalizadosOtros) return { labels: [], datasets: [] }

  const otros = resultados.value?.valoresTotalizadosOtros

  const labels = [
    'Votos Nulos',
    'Votos en Blanco',
    'Votos Recurridos/Impugnados'
  ]

  const data = [
    otros?.votosNulos,
    otros?.votosEnBlanco,
    otros?.votosRecurridosComandoImpugnados
  ]

  const percentages = [
    otros?.votosNulosPorcentaje?.toFixed(1),
    otros?.votosEnBlancoPorcentaje?.toFixed(1),
    otros?.votosRecurridosComandoImpugnadosPorcentaje?.toFixed(1)
  ]

  return {
    labels,
    datasets: [
      {
        data,
        percentages,
        backgroundColor: isDark.value ? [
          colors.gray[800],
          colors.gray[700],
          colors.gray[600],
        ] : [
          colors.gray[500],
          colors.gray[400],
          colors.gray[300],
        ],
        borderColor: isDark.value ? colors.gray[800] : colors.gray[200],
      }
    ]
  }
})

onMounted(() => {
  fetchResultados()
})

watch([anioEleccion, tipoRecuento, tipoEleccion, categoriaId, distritoId, seccionProvincialId, seccionId, circuitoId, mesaId], () => {
  fetchResultados()
}, { deep: true })
</script>

<template>
  <div class="relative space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      <label class="flex flex-row items-center gap-2">
        Año Elección:
        <select v-model="anioEleccion" class="w-full p-2 bg-muted dark:bg-muted">
          <option value="2011">2011</option>
          <option value="2013">2013</option>
          <option value="2015">2015</option>
          <option value="2017">2017</option>
          <option value="2019">2019</option>
          <option value="2021">2021</option>
          <option value="2023">2023</option>
        </select>
      </label>
      <label class="flex flex-row items-center gap-2">
        Tipo Recuento:
        <select v-model="tipoRecuento" class="w-full p-2 bg-muted dark:bg-muted">
          <option value="1">Recuento Provisional</option>
        </select>
      </label>
      <label class="flex flex-row items-center gap-2">
        Tipo Elección:
        <select v-model="tipoEleccion" class="w-full p-2 bg-muted dark:bg-muted">
          <option value="1">PASO</option>
          <option value="2">Elecciones Generales</option>
          <option value="3">Segunda Vuelta</option>
        </select>
      </label>
      <label class="flex flex-row items-center gap-2">
        Categoría:
        <select v-model="categoriaId" class="w-full p-2 bg-muted dark:bg-muted">
          <option value="1">Presidente</option>
          <option value="2">Senadores Nacionales</option>
          <option value="3">Diputados Nacionales</option>
          <option value="4">Gobernador</option>
          <option value="5">Legisladores Provinciales</option>
        </select>
      </label>
      <label class="flex flex-row items-center gap-2">
        Distrito:
        <input type="text" v-model="distritoId" placeholder="Ej: 1" class="w-full p-2 bg-muted dark:bg-muted">
      </label>
      <label class="flex flex-row items-center gap-2">
        Sección Provincial:
        <input type="text" v-model="seccionProvincialId" placeholder="Ej: 0" class="w-full p-2 bg-muted dark:bg-muted">
      </label>
      <label class="flex flex-row items-center gap-2">
        Sección:
        <input type="text" v-model="seccionId" placeholder="Ej: 3" class="w-full p-2 bg-muted dark:bg-muted">
      </label>
      <label class="flex flex-row items-center gap-2">
        Circuito:
        <input type="text" v-model="circuitoId" placeholder="Ej: 000039" class="w-full p-2 bg-muted dark:bg-muted">
      </label>
      <label class="flex flex-row items-center gap-2">
        Mesa:
        <input type="text" v-model="mesaId" placeholder="Ej: 1244" class="w-full p-2 bg-muted dark:bg-muted">
      </label>
    </div>

    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded my-4">
      {{ error }}
    </div>

    <div v-else-if="resultados" class="flex flex-col space-y-6">
      <div class="space-y-4">
        <h3 class="!mt-0">Estado del Recuento</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-3 bg-muted rounded">
            <h4 class="!mt-0 text-muted-foreground">Mesas</h4>
            <div class="flex justify-between items-center">
              <div>
                <div class="text-2xl font-bold">{{ resultados.estadoRecuento.mesasTotalizadas.toLocaleString() }}</div>
                <div v-if="Number(resultados.estadoRecuento.mesasEsperadas) > 0"
                     class="text-sm text-muted-foreground">
                  de {{ resultados.estadoRecuento.mesasEsperadas }}
                </div>
              </div>
              <div v-if="Number(resultados.estadoRecuento.mesasEsperadas) > 0"
                   class="text-xl font-bold text-primary">
                {{ resultados.estadoRecuento.mesasTotalizadasPorcentaje.toFixed(1) }}%
              </div>
            </div>
          </div>
          <div class="p-3 bg-muted rounded">
            <h4 class="!mt-0 text-muted-foreground">Electores</h4>
            <div class="text-2xl font-bold">{{ resultados.estadoRecuento.cantidadElectores.toLocaleString() }}</div>
          </div>
          <div class="p-3 bg-muted rounded">
            <h4 class="!mt-0 text-muted-foreground">Participación</h4>
            <div class="flex justify-between items-center">
              <div>
                <div class="text-2xl font-bold">{{ resultados.estadoRecuento.cantidadVotantes.toLocaleString() }}</div>
                <div class="text-sm text-muted-foreground">votantes</div>
              </div>
              <div class="text-xl font-bold text-primary">
                {{ resultados?.estadoRecuento?.participacionPorcentaje?.toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>
        <div class="text-sm text-muted-foreground">
          Última actualización: {{ new Date(resultados.fechaTotalizacion).toLocaleString() }}
        </div>
      </div>

      <h3>Resultados por Agrupación Política</h3>

      <div class="grid grid-cols-1 gap-6">
        <div>
          <Bar :data="chartDataBar" :options="chartOptionsBar" :height="300" />
        </div>
        <div>
          <Pie :data="chartDataPie" :options="chartOptionsPie" :height="300" />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Agrupación</th>
            <th>Votos</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="agrupacion in resultados.valoresTotalizadosPositivos" :key="agrupacion.idAgrupacion">
            <td>{{ agrupacion.nombreAgrupacion }}</td>
            <td class="text-right">{{ agrupacion.votos?.toLocaleString() }}</td>
            <td class="text-right">{{ agrupacion.votosPorcentaje?.toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>

      <h3>Otros Resultados</h3>

      <div class="grid grid-cols-1 gap-6">
        <div>
          <Doughnut :data="chartDataOtros" :options="chartOptionsOtros" :height="250" />
        </div>
        <div v-if="resultados.valoresTotalizadosOtros">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Votos</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Votos Nulos</td>
                <td class="text-right">{{ resultados.valoresTotalizadosOtros.votosNulos.toLocaleString() }}</td>
                <td class="text-right">{{ resultados.valoresTotalizadosOtros?.votosNulosPorcentaje?.toFixed(1) }}%</td>
              </tr>
              <tr>
                <td>Votos en Blanco</td>
                <td class="text-right">{{ resultados.valoresTotalizadosOtros?.votosEnBlanco?.toLocaleString() }}</td>
                <td class="text-right">{{ resultados.valoresTotalizadosOtros?.votosEnBlancoPorcentaje?.toFixed(1) }}%</td>
              </tr>
              <tr>
                <td>Votos Recurridos/Impugnados</td>
                <td class="text-right">{{ resultados.valoresTotalizadosOtros?.votosRecurridosComandoImpugnados?.toLocaleString() }}</td>
                <td class="text-right">{{ resultados.valoresTotalizadosOtros?.votosRecurridosComandoImpugnadosPorcentaje?.toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="p-4 bg-muted text-gray-700 dark:text-gray-300 rounded my-4">
      Seleccione los parámetros y haga clic en "Buscar" para ver los resultados electorales.
    </div>
  </div>
</template>
