import sharp from 'sharp'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const sourceDirectory = new URL('src/data/photoshoots/', root)
const manifest = {}
let photographs = 0
for (const file of (await readdir(sourceDirectory)).filter(name => name.endsWith('.json')).sort()) {
  const shoot = JSON.parse(await readFile(new URL(file, sourceDirectory), 'utf8'))
  const directory = new URL(`public/photoshootings/optimized/${shoot.slug}/`, root)
  await mkdir(directory, { recursive: true })
  const prepared = new Map()
  manifest[shoot.slug] = {}
  for (const image of [...shoot.frames, shoot.hero]) {
    if (prepared.has(image.original)) {
      manifest[shoot.slug][image.id] = prepared.get(image.original)
      continue
    }
    const input = fileURLToPath(new URL(`public${image.original}`, root))
    const { width, height } = await sharp(input).metadata()
    const variants = []
    const widths = [...new Set([96, 720, 1440, 1920].map(target => Math.min(target, width)))]
    for (const target of widths) {
      const filename = `${image.id}-${target === 96 ? 'thumb' : target}.webp`
      const result = await sharp(input).resize({ width: target, withoutEnlargement: true })
        .webp({ quality: target === 96 ? 65 : 82 }).toFile(fileURLToPath(new URL(filename, directory)))
      variants.push({ src: `/photoshootings/optimized/${shoot.slug}/${filename}`, width: result.width })
    }
    const display = variants.filter(variant => variant.width > 96)
    const asset = {
      width, height,
      src: (display.find(variant => variant.width >= 1440) || display.at(-1)).src,
      srcset: [...display, ...(display.some(variant => variant.width === width) ? [] : [{ src: image.original, width }])]
        .map(variant => `${variant.src} ${variant.width}w`).join(', '),
      thumb: variants[0].src,
    }
    prepared.set(image.original, asset)
    manifest[shoot.slug][image.id] = asset
  }
  photographs += shoot.frames.length
  console.log(`${shoot.slug}: ${shoot.frames.length} photographs and cover prepared`)
}
await writeFile(new URL('src/data/photoshoot-images.json', root), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Prepared ${photographs} gallery photographs across ${Object.keys(manifest).length} shoots.`)
