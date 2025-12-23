<script setup>
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const componentsMap = {
  'getEstadisticasV4Metodologia': defineAsyncComponent(() => import('./OperationExamples/GetEstadisticasV4MetodologiaExamples.vue')),
  'getEstadisticasV4MetodologiaByIdVariable': defineAsyncComponent(() => import('./OperationExamples/GetEstadisticasV4MetodologiaByIdVariableExamples.vue')),
  'getEstadisticasV4Monetarias': defineAsyncComponent(() => import('./OperationExamples/GetEstadisticasV4MonetariasExamples.vue')),
  'getEstadisticasV4MonetariasByIdVariable': defineAsyncComponent(() => import('./OperationExamples/GetEstadisticasV4MonetariasByIdVariableExamples.vue')),
}

const component = computed(() => componentsMap[props.operationId] || null)
</script>

<template>
  <div v-if="component" class="flex flex-col">
    <h2>Ejemplos de uso</h2>
    <component :is="component" :operationId="props.operationId" />
  </div>
</template>
