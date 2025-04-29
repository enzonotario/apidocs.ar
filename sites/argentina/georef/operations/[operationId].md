---
aside: false
outline: false
title: vitepress-openapi
---

<script setup lang="ts">
import { useRoute } from 'vitepress'
import OperationExamples from '../.vitepress/theme/components/OperationExamples.vue'
import GetFilenamePlayground from '../.vitepress/theme/components/GetFilenamePlayground.vue'

const route = useRoute()

const operationId = route.data.params.operationId

const isFilenameOperation = operationId === 'get-{filename}'
</script>

<OAOperation :operationId="operationId">

<template v-if="isFilenameOperation" #playground>

<GetFilenamePlayground />

</template>

<template v-if="isFilenameOperation" #code-samples>

## Ejemplos

```js
https://apis.datos.gob.ar/georef/api/provincias.csv
```

</template>

<template v-if="!isFilenameOperation" #footer="footer">

<ClientOnly>

<Suspense>

<OperationExamples :operationId="operationId" />

</Suspense>

</ClientOnly>

</template>

</OAOperation>
