---
aside: true
outline: [1,2]
sidebar: false
title: {{name}}
prev: false
next: false
---

<script setup>
import spec from './public/openapi.json'
</script>

<OASpec :spec="spec" />
