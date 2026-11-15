import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SITE = 'https://amalfi.day'
const ROOT = fileURLToPath(new URL('.', import.meta.url))
const buildDate = new Date().toISOString()

// Sitemap lastmod: date of the last git commit touching the page's source
// (plus its photoshoot JSON, where one exists). Falls back to the build date
// for dynamic routes such as Ghost posts, or when git history is unavailable.
const lastmodCache = new Map()
const sourceFiles = (pathname) => {
  const clean = pathname.replace(/^\/+|\/+$/g, '')
  const candidates = clean
    ? ['.astro', '.md', '.mdx'].flatMap((ext) => [
        `src/pages/${clean}${ext}`,
        `src/pages/${clean}/index${ext}`,
      ])
    : ['src/pages/index.astro']
  if (clean.startsWith('photoshootings/')) {
    candidates.push(`src/data/photoshoots/${clean.slice('photoshootings/'.length)}.json`)
  }
  return candidates.filter((file) => existsSync(new URL(file, `file://${ROOT}`)))
}
const lastmodFor = (url) => {
  const pathname = new URL(url).pathname
  if (lastmodCache.has(pathname)) return lastmodCache.get(pathname)
  let value = buildDate
  const files = sourceFiles(pathname)
  if (files.length) {
    try {
      const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
      if (out) value = new Date(out).toISOString()
    } catch {
      // git unavailable: keep the build date
    }
  }
  lastmodCache.set(pathname, value)
  return value
}

export default defineConfig({
  site: SITE,
  output: 'static',
  redirects: {
    '/photoshootings/tom-semb-atrani/': '/photoshootings/tom-sam-atrani/',
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/edit/') &&
        !page.includes('/photoshootings/tom-semb-atrani') &&
        !page.includes('/design-guidelines') &&
        !page.includes('/photoshootings/template') &&
        !page.includes('/parking-in-amalfi-coast-2025') &&
        !page.includes('/beaches-in-amalfi') &&
        !page.includes('/amalfi-coast-on-the-moto') &&
        !page.endsWith('/photo/') &&
        !page.endsWith('/experience/photo-shoot/') &&
        !page.endsWith('/guide/'),
      serialize: (item) => ({ ...item, lastmod: lastmodFor(item.url) }),
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
