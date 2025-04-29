<script setup>
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const componentsMap = {
  'get-provincias': defineAsyncComponent(() => import('./OperationExamples/GetProvinciasExamples.vue')),
  'get-departamentos': defineAsyncComponent(() => import('./OperationExamples/GetDepartamentosExamples.vue')),
  'get-municipios': defineAsyncComponent(() => import('./OperationExamples/GetMunicipiosExamples.vue')),
  'get-localidades-censales': defineAsyncComponent(() => import('./OperationExamples/GetLocalidadesCensalesExamples.vue')),
  'get-asentamientos': defineAsyncComponent(() => import('./OperationExamples/GetAsentamientosExamples.vue')),
  'get-localidades': defineAsyncComponent(() => import('./OperationExamples/GetLocalidadesExamples.vue')),
  'get-calles': defineAsyncComponent(() => import('./OperationExamples/GetCallesExamples.vue')),
  'get-direcciones': defineAsyncComponent(() => import('./OperationExamples/GetDireccionesExamples.vue')),
  'get-ubicacion': defineAsyncComponent(() => import('./OperationExamples/GetUbicacionExamples.vue')),
}

const component = computed(() => componentsMap[props.operationId] || null)
</script>

<template>
  <div v-if="component" class="flex flex-col">
    <h2>Ejemplos de uso</h2>
    <component :is="component" :operationId="props.operationId" />
  </div>
</template>
