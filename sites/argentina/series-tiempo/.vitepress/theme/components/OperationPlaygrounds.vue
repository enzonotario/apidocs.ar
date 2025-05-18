<script setup>
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps({
  operationId: {
    type: String,
    required: true
  }
})

const componentsMap = {
  'dump': defineAsyncComponent(() => import('./OperationPlaygrounds/DumpPlayground.vue')),
  'dump_catalogo': defineAsyncComponent(() => import('./OperationPlaygrounds/DumpCatalogoPlayground.vue')),
}

const component = computed(() => componentsMap[props.operationId] || null)
</script>

<template>
  <div v-if="component" class="flex flex-col">
    <component :is="component" :operationId="props.operationId" />
  </div>
</template>
