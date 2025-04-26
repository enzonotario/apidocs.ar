<script setup>
import { sites } from '../../../lista.ts'
import { computed } from 'vue'
import VPButton from 'vitepress/dist/client/theme-default/components/VPButton.vue'

const latestSites = computed(() => {
  return sites.slice(-9).reverse()
})
</script>

<template>
  <div class="py-8 space-y-6">
    <div class="space-y-4">
      <h1 class="!text-4xl md:!text-5xl lg:!text-6xl !font-bold text-[var(--vp-home-hero-name-color)]">
        apidocs.ar
      </h1>
      <p class="text-xl">Documentación de APIs</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="site in latestSites"
           :key="site.subdomain"
           class="border border-[var(--vp-c-divider)] rounded-lg p-4 hover:border-[var(--vp-c-neutral)]">
        <h3 class="text-lg font-semibold !mt-0">
          <a :href="`https://${site.subdomain}.apidocs.ar`"
             target="_blank"
             class="text-primary !no-underline hover:!underline">
            {{ site.name }}
          </a>
        </h3>
        <p class="text-[var(--vp-c-text-1)]">{{ site.description }}</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in site.tags"
                :key="tag"
                class="bg-[var(--vp-c-bg-alt)] text-[var(--vp-c-primary-text)] text-xs font-semibold rounded-full px-2 py-1">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex justify-center items-center">
      <VPButton href="/lista.html" text="Listado de APIs" class="!no-underline"></VPButton>
    </div>
  </div>
</template>
