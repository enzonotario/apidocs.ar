<script setup>
import { sites } from '../../../lista.ts'
import { computed } from 'vue'

const sections = computed(() => {
  const grouped = {}

  for (const site of sites) {
    for (const tag of site.tags) {
      if (!grouped[tag]) {
        grouped[tag] = []
      }
      grouped[tag].push(site)
    }
  }

  return Object.entries(grouped).map(([tag, items]) => ({
    tag,
    sites: items,
  }))
})
</script>

<template>
  <div class="py-8 space-y-10">
    <div class="space-y-4 text-center">
      <h1 class="!text-4xl md:!text-5xl lg:!text-6xl !font-bold text-[var(--vp-home-hero-name-color)]">
        apidocs.ar
      </h1>
      <p class="text-xl">Documentaciones de APIs públicas</p>
    </div>

    <section
      v-for="section in sections"
      :key="section.tag"
      class="space-y-4"
    >
      <h3 class="!mt-0 !mb-0 text-2xl font-semibold text-center md:text-left">
        {{ section.tag }}
      </h3>

      <div class="flex flex-wrap">
        <a
          v-for="site in section.sites"
          :key="site.subdomain"
          :href="`https://${site.subdomain}.apidocs.ar`"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`Ver documentación de ${site.name}`"
          class="w-full max-w-full sm:w-1/2 md:w-1/3 p-2 flex !no-underline"
        >
          <div class="flex-1 border border-[var(--vp-c-divider)] rounded-lg p-4 hover:border-[var(--vp-c-neutral)] text-center space-y-4">
            <div>
              <h3 class="text-lg font-semibold !mt-0 text-primary !no-underline hover:!underline">
                {{ site.name }}
              </h3>
            </div>
            <p class="text-[var(--vp-c-text-1)]">{{ site.description }}</p>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>
