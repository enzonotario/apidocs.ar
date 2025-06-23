<script setup>
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const componentsMap = {
  'post-credito': defineAsyncComponent(() => import('./OperationExamples/PostCreditoExamples.vue')),
  'post-recurso': defineAsyncComponent(() => import('./OperationExamples/PostRecursoExamples.vue')),
  'post-pef': defineAsyncComponent(() => import('./OperationExamples/PostPefExamples.vue')),
  'post-transversal_financiero': defineAsyncComponent(() => import('./OperationExamples/PostTransversalFinancieroExamples.vue')),
}

const component = computed(() => componentsMap[props.operationId] || null)
</script>

<template>
  <div v-if="component" class="flex flex-col">
    <h2>Ejemplos de uso</h2>
    <component :is="component" :operationId="props.operationId" />
  </div>
</template>
