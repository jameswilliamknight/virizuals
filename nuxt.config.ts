import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2026-10-20',
  css: ['~/assets/main.css'],
  vite: { plugins: [tailwindcss()] },
  devtools: { enabled: false },
  app: { head: { title: 'virizuals', htmlAttrs: { lang: 'en', class: 'dark' }, link: [{ rel: 'icon', type: 'image/svg+xml', href: 'favicon.svg' }], meta: [{ name: 'description', content: 'A fullscreen LCD ripple playground.' }] } },
})
