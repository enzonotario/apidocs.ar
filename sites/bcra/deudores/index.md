---
aside: true
outline: [1,2]
sidebar: false
title: Deudores BCRA
prev: false
next: false
---

<script setup>
import { useTheme } from 'vitepress-openapi/client'
import spec from './public/openapi.json'

useTheme({
    i18n: {
        locale: 'es',
    }
})
</script>

<OASpec :spec="spec" />
