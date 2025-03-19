import type { Theme } from 'vitepress'
import { theme, useTheme } from 'vitepress-openapi/client'

import DefaultTheme from 'vitepress/theme'
import 'vitepress-openapi/dist/style.css'
import './style.css'

export default {
  ...DefaultTheme,
  async enhanceApp({ app, router, siteData }) {
    useTheme({
      i18n: {
        locale: 'es',
      },
    })

    theme.enhanceApp({ app })
  },
} satisfies Theme
