<script setup>
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const componentsMap = {
  'series': defineAsyncComponent(() => import('./OperationExamples/SeriesExamples.vue')),
  'search': defineAsyncComponent(() => import('./OperationExamples/SearchExamples.vue')),
  'search_listas': defineAsyncComponent(() => import('./OperationExamples/SearchListasExamples.vue')),
}

const component = computed(() => componentsMap[props.operationId] || null)
</script>

<template>
  <div v-if="component" class="flex flex-col">
    <h2>Ejemplos de uso</h2>
    <component :is="component" :operationId="props.operationId" />
  </div>
</template>
