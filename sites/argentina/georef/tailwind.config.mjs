/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './.vitepress/theme/**/*.{js,vue,ts,json,md}',
    './.vitepress/config.{js,ts,mts}',
    './**/*.md',
  ],
}
