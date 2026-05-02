#!/usr/bin/env node
// Inject width/height attributes onto <img src="/..."> tags by reading the
// referenced public/ asset with sharp. Only static-string src attributes are
// processed; dynamic JSX expressions ({foo.image}) are skipped and reported.
//
// Idempotent: skips images that already have width or height attributes.

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { glob } from 'node:fs/promises'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const PUBLIC_ROOT = resolve(ROOT, 'public')

const tagRe = /<img\b[^>]*\bsrc="(\/[^"\s]+)"[^>]*>/g
const hasDimRe = /\b(width|height)\s*=\s*["{][^"}]*["}]/

const dimCache = new Map()
async function getDims(publicPath) {
  if (dimCache.has(publicPath)) return dimCache.get(publicPath)
  const abs = resolve(PUBLIC_ROOT, publicPath.replace(/^\//, ''))
  try {
    const meta = await sharp(abs).metadata()
    if (!meta.width || !meta.height) throw new Error('no dimensions')
    const result = { width: meta.width, height: meta.height }
    dimCache.set(publicPath, result)
    return result
  } catch (e) {
    dimCache.set(publicPath, null)
    return null
  }
}

async function processFile(file) {
  const src = await readFile(file, 'utf8')
  const matches = []
  for (const m of src.matchAll(tagRe)) matches.push(m)
  if (!matches.length) return { file, edited: 0, skipped: 0, missing: [] }

  let out = src
  let edited = 0
  let skipped = 0
  const missing = []

  // Walk in reverse so indices stay valid as we edit.
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i]
    const tag = m[0]
    const imgPath = m[1]
    if (hasDimRe.test(tag)) {
      skipped++
      continue
    }
    const dims = await getDims(imgPath)
    if (!dims) {
      missing.push(imgPath)
      continue
    }
    // Insert width/height before the closing `/>` or `>`.
    const newTag = tag.replace(/\s*\/?>$/, ` width="${dims.width}" height="${dims.height}"$&`)
    out = out.slice(0, m.index) + newTag + out.slice(m.index + tag.length)
    edited++
  }

  if (edited) await writeFile(file, out)
  return { file, edited, skipped, missing }
}

const files = []
for await (const f of glob('src/{pages,components,layouts}/**/*.astro', { cwd: ROOT })) {
  files.push(resolve(ROOT, f))
}

let totalEdited = 0
let totalSkipped = 0
const allMissing = []
for (const f of files) {
  const r = await processFile(f)
  if (r.edited || r.missing.length) {
    console.log(`${r.file.replace(ROOT + '/', '')} — edited ${r.edited}, skipped ${r.skipped}, missing ${r.missing.length}`)
  }
  totalEdited += r.edited
  totalSkipped += r.skipped
  allMissing.push(...r.missing)
}

console.log(`\nTotal: edited ${totalEdited} img tags across ${files.length} files (${totalSkipped} already had dimensions)`)
if (allMissing.length) {
  console.log(`\nMissing public asset for ${allMissing.length} src paths:`)
  for (const p of [...new Set(allMissing)]) console.log(`  ${p}`)
}
