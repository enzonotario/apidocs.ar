import type { Theme } from 'vitepress'
import { ApiDocsLayout } from '@apidocs.ar/core'
import { theme, useOpenapi, useShiki, useTheme } from 'vitepress-openapi/client'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import spec from '../../public/openapi.json'

import 'vitepress-openapi/dist/style.css'
import '@apidocs.ar/core/dist/index.css'
import './style.css'

export default {
  ...DefaultTheme,
  Layout: () => h(ApiDocsLayout, {
    Theme: DefaultTheme,
  }),
  async enhanceApp({ app }) {
    useTheme({
      i18n: {
        locale: 'es',
      },
      path: {
        showBaseURL: true,
      },
    })

    await useShiki().initShiki()

    await useOpenapi().async({
      spec,
    })

    theme.enhanceApp({ app })
  },
} satisfies Theme
