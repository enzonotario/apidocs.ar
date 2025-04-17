import type { Theme } from 'vitepress'
import { theme, useTheme, useShiki } from 'vitepress-openapi/client'
import DefaultTheme from 'vitepress/theme'

import ApiDocsLayout from './ApiDocsLayout.vue'
import 'vitepress-openapi/dist/style.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: ApiDocsLayout,
  async enhanceApp({ app }) {
    useTheme({
      i18n: {
        locale: 'es',
      },
    })

    await useShiki().initShiki()

    theme.enhanceApp({ app })
  },
} satisfies Theme
