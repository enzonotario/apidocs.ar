import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

// import { theme } from 'vitepress-openapi/client';
// import 'vitepress-openapi/dist/style.css';
// import './style.css'

export default {
  ...DefaultTheme,
  // async enhanceApp({ app, router, siteData }) {
  //   theme.enhanceApp({ app });
  // },
} satisfies Theme
