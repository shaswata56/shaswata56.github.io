import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: true,
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    baseURL: '/',
    buildAssetsDir: 'nuxt-assets',
  },
  routeRules: {
    '/': { prerender: true }
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  css: ['~/assets/css/fonts.css',
        '~/assets/css/main.css',
        '~/assets/css/devicon-subset.css',
        '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },
  build: {
    transpile: ['@fortawesome/vue-fontawesome']
  },
})
