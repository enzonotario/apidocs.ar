<script setup>
import { ref } from 'vue'

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const error = ref(null)
const data = ref(null)
const selectedList = ref('dataset_theme')

const listOptions = [
  { value: 'dataset_theme', label: 'Temáticas' },
  { value: 'dataset_source', label: 'Fuentes' },
  { value: 'dataset_publisher_name', label: 'Publicadores' },
  { value: 'field_units', label: 'Unidades' },
  { value: 'catalog_id', label: 'Catálogos' }
]

async function fetchData() {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`https://apis.datos.gob.ar/series/api/search/${selectedList.value}`)
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status}`)
    }
    data.value = await response.json()
    loading.value = false
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}

fetchData()

function handleListChange() {
  fetchData()
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-2">
      <label class="font-bold">Tipo de lista</label>
      <select v-model="selectedList" @change="handleListChange" class="w-full p-2 rounded">
        <option v-for="option in listOptions" :key="option.value" :value="option.value">
          {{ option.label }} ({{ option.value }})
        </option>
      </select>
    </div>
    
    <div v-if="loading" class="text-center py-4">
      Cargando datos...
    </div>
    
    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>
    
    <div v-else>
      <h3>Lista de {{ listOptions.find(opt => opt.value === selectedList)?.label || selectedList }}</h3>
      
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data.data" :key="index">
            <td>{{ item }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>