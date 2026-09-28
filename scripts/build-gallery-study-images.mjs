import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

// Regenerate the study's small previews and responsive images; keep originals intact.
const ids = ['02', '05', '08', '07', '20', '10', '13', '12', '23', '29', '33', '34']
const output = new URL('../public/photoshootings/gallery-study/', import.meta.url)
await mkdir(output, { recursive: true })
for (const id of ids) {
  const input = new URL(`../public/photoshootings/individual/Loreana/Loreana-photoshooting-in-amalfi-ravello-september-2025-${id}.webp`, import.meta.url)
  for (const width of [96, 720, 1440]) {
    await sharp(input.pathname)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width === 96 ? 65 : 82 })
      .toFile(new URL(`${id}-${width === 96 ? 'thumb' : width}.webp`, output).pathname)
  }
}
console.log(`Prepared ${ids.length} photographs in three sizes.`)
