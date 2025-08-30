import type { Theme } from 'vitepress'
import { ApiDocsLayout } from '@apidocs.ar/core'
import VPUtterances from 'vitepress-plugin-utterances'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import '@apidocs.ar/core/dist/index.css'
import './style.css'

export default {
  ...DefaultTheme,
  Layout: () => h(ApiDocsLayout, {
    Theme: DefaultTheme,
  }),
  enhanceApp({ app }) {
    app.use(VPUtterances)
  },
} satisfies Theme
