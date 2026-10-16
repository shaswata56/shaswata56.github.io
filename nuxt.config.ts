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
      // The only Nuxt route is '/'. Link discovery adds nothing here — and it
      // follows hrefs like "garden/" into prerendering app.vue for them,
      // which overwrites public/garden/index.html with a homepage render.
      crawlLinks: false,
      ignore: ['/garden/'],
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
