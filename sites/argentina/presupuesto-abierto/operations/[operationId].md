---
aside: false
outline: false
title: vitepress-openapi
---

<script setup lang="ts">
import { useRoute } from 'vitepress'
import OperationExamples from '../.vitepress/theme/components/OperationExamples.vue'

const route = useRoute()

const operationId = route.data.params.operationId
</script>

<OAOperation :operationId="operationId">

<template #footer="footer">
  <ClientOnly>
    <Suspense>
      <OperationExamples :operationId="operationId" />
    </Suspense>
  </ClientOnly>
</template>

</OAOperation>
