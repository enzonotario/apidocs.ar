<script setup>
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const componentsMap = {
  'get-organismos': defineAsyncComponent(() => import('./OperationExamples/GetOrganismosExamples.vue')),
  'get-tramites': defineAsyncComponent(() => import('./OperationExamples/GetTramitesExamples.vue')),
  'get-convocatorias': defineAsyncComponent(() => import('./OperationExamples/GetConvocatoriasExamples.vue')),
}

const component = computed(() => componentsMap[props.operationId] || null)
</script>

<template>
  <div v-if="component" class="flex flex-col">
    <h2>Ejemplos de uso</h2>
    <component :is="component" :operationId="props.operationId" />
  </div>
</template>
