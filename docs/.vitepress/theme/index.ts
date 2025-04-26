import type {Theme} from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ApiDocsLayout from './ApiDocsLayout.vue'

import './style.css'

export default {
  ...DefaultTheme,
  Layout: ApiDocsLayout,
} satisfies Theme
