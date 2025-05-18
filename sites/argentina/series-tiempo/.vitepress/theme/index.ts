import type { Theme } from 'vitepress'
import { theme, useOpenapi, useShiki, useTheme } from 'vitepress-openapi/client'
import DefaultTheme from 'vitepress/theme'

import spec from '../../public/openapi.json'
import ApiDocsLayout from './ApiDocsLayout.vue'

import 'vitepress-openapi/dist/style.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: ApiDocsLayout,
  async enhanceApp({ app }) {
    await useShiki().initShiki()

    await useOpenapi().async({
      spec,
    })

    theme.enhanceApp({ app })
  },
} satisfies Theme
