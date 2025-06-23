import { defineConfig } from 'vitepress'
import { useSidebar } from 'vitepress-openapi'
import spec from '../public/openapi.json'

const gaId = process.env.NODE_ENV === 'production' ? 'G-4RPLQ59LN8' : 'G-TEST'

const sidebar = useSidebar({ spec })

export default defineConfig({
  lang: 'es-AR',
  title: 'Presupuesto Abierto',
  description: 'API de Presupuesto Abierto de la República Argentina',
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/enzonotario/apidocs.ar' },
    ],

    nav: [
      { text: 'apidocs.ar', link: 'https://apidocs.ar' },
    ],

    footer: {
      message: 'Liberado bajo la <a href="https://github.com/enzonotario/apidocs.ar/blob/main/LICENSE">Licencia MIT</a>.',
    },

    sidebar: [
      {
        text: 'Introducción',
        link: '/',
      },

      ...sidebar.generateSidebarGroups(),
    ],
  },
  head: [
    // ['link', {rel: 'icon', type: 'image/png', href: '/logo.png'}],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'es' }],
    ['meta', { name: 'og:site_name', content: 'apidocs.ar' }],
    ['meta', { name: 'og:image', content: 'https://apidocs.ar/og.png' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'apidocs.ar' }],
    ['meta', { name: 'twitter:description', content: 'Documentaciones de APIs públicas' }],

    // Google Analytics.
    [
      'script',
      { async: '', src: `https://www.googletagmanager.com/gtag/js?id=${gaId}` },
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');`,
    ],
  ],
})
