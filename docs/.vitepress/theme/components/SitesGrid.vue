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
    <div class="space-y-4 text-center">
      <h1 class="!text-4xl md:!text-5xl lg:!text-6xl !font-bold text-[var(--vp-home-hero-name-color)]">
        apidocs.ar
      </h1>
      <p class="text-xl">Documentaciones de APIs públicas</p>
    </div>

    <div class="flex flex-wrap justify-center">
      <a v-for="site in latestSites"
         :key="site.subdomain"
         :href="`https://${site.subdomain}.apidocs.ar`"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Ver documentación"
         class="w-full max-w-full sm:w-1/2 md:w-1/3 p-2 flex !no-underline">
        <div class="flex-1 border border-[var(--vp-c-divider)] rounded-lg p-4 hover:border-[var(--vp-c-neutral)] text-center space-y-4">
          <div class="flex flex-wrap justify-center items-center gap-2">
            <span v-for="tag in site.tags"
                  :key="tag"
                  class="bg-[var(--vp-c-bg-alt)] text-[var(--vp-c-primary-text)] text-xs font-semibold rounded-full px-2 py-1">
              {{ tag }}
            </span>
          </div>
          <div>
            <h3 class="text-lg font-semibold !mt-0 text-primary !no-underline hover:!underline">
              {{ site.name }}
            </h3>
          </div>
          <p class="text-[var(--vp-c-text-1)]">{{ site.description }}</p>
        </div>
      </a>
    </div>

    <div class="flex justify-center items-center">
      <VPButton href="/lista.html" text="Listado de APIs" class="!no-underline"></VPButton>
    </div>
  </div>
</template>
