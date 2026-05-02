import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://amalfi.day',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/edit/') &&
        !page.includes('/design-guidelines') &&
        !page.includes('/photoshootings/template') &&
        !page.includes('/parking-in-amalfi-coast-2025') &&
        !page.includes('/beaches-in-amalfi') &&
        !page.includes('/amalfi-coast-on-the-moto') &&
        !page.endsWith('/photo/') &&
        !page.endsWith('/experience/photo-shoot/') &&
        !page.endsWith('/guide/') &&
        !page.endsWith('/how-to-get/') &&
        !page.endsWith('/what-to-do/'),
    }),
  ],
  vite: {
    server: {
      proxy: {
        '/api': 'http://localhost:8787',
      },
    },
  },
})
