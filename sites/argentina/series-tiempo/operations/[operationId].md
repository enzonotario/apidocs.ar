---
aside: false
outline: false
title: vitepress-openapi
---

<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useTheme } from 'vitepress-openapi/client'
import OperationExamples from '../.vitepress/theme/components/OperationExamples.vue'
import OperationPlaygrounds from '../.vitepress/theme/components/OperationPlaygrounds.vue'
import GetFilenamePlayground from '../.vitepress/theme/components/OperationPlaygrounds/GetFilenamePlayground.vue'

const route = useRoute()

const operationId = route.data.params.operationId

const isDumpOperation = ['dump', 'dump_catalogo'].includes(operationId)

useTheme({
    i18n: {
        locale: 'es',
    },
    playground: {
        jsonEditor: {
            mode: 'text',
        },
    },
    path: {
        showBaseURL: true,
    },
    operation: {
        // cols: 2,
        hiddenSlots: isDumpOperation ? ['code-samples'] : [],
    },
    requestBody: {
        defaultView: 'schema',
    },
    response: {
        body: {
            defaultView: 'schema',
        },
    },
})
</script>

<OAOperation :operationId="operationId">

<template v-if="isDumpOperation" #playground>

## Playground

<OperationPlaygrounds :operationId="operationId" />

</template>

<template v-if="!isDumpOperation" #footer="footer">

<ClientOnly>

<Suspense>

<OperationExamples :operationId="operationId" />

</Suspense>

</ClientOnly>

</template>

</OAOperation>
