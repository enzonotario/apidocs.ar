<script setup>
import { defineProps } from "vue";
import "./style.css";

const { Theme } = defineProps(["Theme"]);
</script>

<template>
  <Theme.Layout>
    <template #layout-top>
      <div class="relative w-full h-px">
        <div class="fixed top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)] dark:bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
      </div>
    </template>
  </Theme.Layout>
</template>
