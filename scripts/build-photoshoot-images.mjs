import sharp from 'sharp'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const sourceDirectory = new URL('src/data/photoshoots/', root)
const manifestUrl = new URL('src/data/photoshoot-images.json', root)
// Pass shoot slugs to rebuild only those shoots and preserve all other assets.
const resume = process.argv.includes('--resume')
const requested = new Set(process.argv.slice(2).filter(arg => arg !== '--resume'))
const files = (await readdir(sourceDirectory)).filter(name => name.endsWith('.json')).sort()
for (const slug of requested) {
  if (!files.includes(`${slug}.json`)) throw new Error(`Unknown photoshoot: ${slug}`)
}
const manifest = requested.size ? JSON.parse(await readFile(manifestUrl, 'utf8')) : {}
let photographs = 0
let processed = 0
for (const file of files) {
  const shoot = JSON.parse(await readFile(new URL(file, sourceDirectory), 'utf8'))
  if (requested.size && !requested.has(shoot.slug)) continue
  const directory = new URL(`public/photoshootings/optimized/${shoot.slug}/`, root)
  await mkdir(directory, { recursive: true })
  const prepared = new Map()
  manifest[shoot.slug] = {}
  for (const image of [...shoot.frames, shoot.hero]) {
    const inputPath = image.sourceFile || `public${image.original}`
    if (prepared.has(inputPath)) {
      manifest[shoot.slug][image.id] = prepared.get(inputPath)
      continue
    }
    const input = fileURLToPath(new URL(inputPath, root))
    const metadata = await sharp(input).metadata()
    const { width, height } = metadata.autoOrient || metadata
    if (!width || !height) throw new Error(`Missing image dimensions: ${inputPath}`)
    const variants = []
    const scale = image.sourceFile ? Math.min(1, 2560 / Math.max(width, height)) : 1
    const webWidth = Math.round(width * scale)
    let pixels
    const render = async (output, target, quality) => {
      if (resume) {
        const existing = await sharp(output).metadata().catch(() => null)
        if (existing?.width) return existing
      }
      // Decode each large JPEG only once, then derive every size from uncompressed pixels.
      if (!pixels) pixels = await sharp(input).rotate().resize({ width: webWidth, withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true })
      return sharp(pixels.data, { raw: pixels.info }).resize({ width: target, withoutEnlargement: true })
        .webp({ quality, effort: 3 }).toFile(output)
    }
    // Full-frame web copies strip camera metadata and leave private source JPEGs untouched.
    if (image.sourceFile) {
      const full = await render(fileURLToPath(new URL(`public${image.original}`, root)), webWidth, 86)
      variants.push({ src: image.original, width: full.width })
    }
    const widths = [...new Set([96, 720, 1440, 1920].map(target => Math.min(target, webWidth)))]
    let thumb
    for (const target of widths) {
      if (target !== 96 && variants.some(variant => variant.width === target)) continue
      const filename = `${image.id}-${target === 96 ? 'thumb' : target}.webp`
      const result = await render(fileURLToPath(new URL(filename, directory)), target, target === 96 ? 65 : 82)
      const variant = { src: `/photoshootings/optimized/${shoot.slug}/${filename}`, width: result.width }
      if (target === 96) thumb = variant.src
      else variants.push(variant)
    }
    variants.sort((a, b) => a.width - b.width)
    if (!image.sourceFile && !variants.some(variant => variant.width === width)) variants.push({ src: image.original, width })
    const asset = {
      width, height,
      src: (variants.find(variant => variant.width >= 1440) || variants.at(-1)).src,
      srcset: variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
      thumb,
    }
    prepared.set(inputPath, asset)
    manifest[shoot.slug][image.id] = asset
  }
  photographs += prepared.size
  processed++
  await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`${shoot.slug}: ${prepared.size} photographs prepared`)
}
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Prepared ${photographs} photographs across ${processed} shoots.`)
