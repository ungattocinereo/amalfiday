import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import node from '@astrojs/node'

export default defineConfig({
  site: 'https://amalfi.day',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [mdx()],
})
