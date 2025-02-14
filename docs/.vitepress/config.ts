import { defineConfig } from 'vitepress';
// import { useSidebar } from 'vitepress-openapi'

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: 'en-US',
  title: 'apidocs.ar',
  description: 'API Docs',

  themeConfig: {
    nav: [
      // {
      //   text: 'API Reference',
      //   link: '/introduction'
      // }
    ],

    sidebar: [
      // {
      //   text: 'By Tags',
      //   items: [
      //     {
      //       text: 'Introduction',
      //       link: '/introduction',
      //     },
      //     ...sidebar.itemsByTags(),
      //   ],
      // },
      // {
      //   text: 'By Paths',
      //   items: [
      //     ...sidebar.itemsByPaths(),
      //   ],
      // },
      // {
      //   text: 'One Page',
      //   items: [
      //     { text: 'One Page', link: '/one-page' },
      //     { text: 'Without Sidebar', link: '/without-sidebar' },
      //   ],
      // },
    ],
  },
  cleanUrls: true,
});
