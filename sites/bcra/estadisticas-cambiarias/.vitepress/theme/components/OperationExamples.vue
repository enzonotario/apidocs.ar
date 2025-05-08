<script setup>
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const componentsMap = {
  'get-divisas': defineAsyncComponent(() => import('./OperationExamples/GetDivisasExamples.vue')),
  'get-cotizaciones': defineAsyncComponent(() => import('./OperationExamples/GetCotizacionesExamples.vue')),
  'get-cotizaciones-codMoneda': defineAsyncComponent(() => import('./OperationExamples/GetCotizacionesCodModExamples.vue')),
}

const component = computed(() => componentsMap[props.operationId] || null)
</script>

<template>
  <div v-if="component" class="flex flex-col">
    <h2>Ejemplos de uso</h2>
    <component :is="component" :operationId="props.operationId" />
  </div>
</template>
