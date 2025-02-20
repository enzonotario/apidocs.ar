import { defineConfig } from 'vitepress'

const gaId = process.env.NODE_ENV === 'production' ? 'G-4RPLQ59LN8' : 'G-TEST'

export default defineConfig({
  lang: 'es-AR',
  title: 'Cheques BCRA',
  description: 'Cheques denunciados',
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/enzonotario/apidocs.ar' },
    ],

    footer: {
      message: 'Liberado bajo la <a href="https://github.com/enzonotario/apidocs.ar/blob/main/LICENSE">Licencia MIT</a>.',
    },
  },
  head: [
    // ['link', {rel: 'icon', type: 'image/png', href: '/logo.png'}],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'es' }],
    ['meta', { name: 'og:site_name', content: 'apidocs.ar' }],
    ['meta', { name: 'og:image', content: 'https://apidocs.ar/og.png' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'apidocs.ar' }],
    ['meta', { name: 'twitter:description', content: 'Documentación de APIs' }],

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
