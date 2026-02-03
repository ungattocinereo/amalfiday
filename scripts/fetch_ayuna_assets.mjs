import fs from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('public/photoshootings/ayuna')

const media = [
  { id: 4642, name: 'ayuna-01' },
  { id: 4643, name: 'ayuna-02' },
  { id: 4644, name: 'ayuna-03' },
  { id: 4645, name: 'ayuna-04' },
  { id: 4647, name: 'ayuna-05' },
  { id: 4646, name: 'ayuna-06' },
  { id: 4649, name: 'ayuna-07' },
  { id: 4517, name: 'ayuna-circle-01' },
  { id: 4502, name: 'ayuna-circle-02' },
  { id: 4341, name: 'ayuna-circle-03' },
  { id: 4185, name: 'ayuna-circle-04' },
  { id: 4089, name: 'ayuna-circle-05' },
  { id: 5282, name: 'ayuna-circle-06' },
  { id: 4917, name: 'ayuna-circle-07' },
  { id: 4754, name: 'ayuna-circle-08' },
  { id: 4662, name: 'ayuna-circle-09' },
  { id: 4516, name: 'ayuna-circle-10' },
]

const apiBase = 'https://amalfi.day/wp-json/wp/v2/media'

const fetchJson = async (url) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  }
  return res.json()
}

const download = async (url, dest) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(dest, buffer)
}

const main = async () => {
  await fs.mkdir(outDir, { recursive: true })

  for (const item of media) {
    const data = await fetchJson(`${apiBase}/${item.id}`)
    const sourceUrl = data?.media_details?.sizes?.full?.source_url || data?.source_url
    if (!sourceUrl) {
      throw new Error(`Missing source_url for media id ${item.id}`)
    }

    const dest = path.join(outDir, `${item.name}.jpg`)

    try {
      await fs.access(dest)
      console.log(`Skipping existing ${dest}`)
      continue
    } catch {
      // continue to download
    }

    console.log(`Downloading ${item.id} -> ${dest}`)
    await download(sourceUrl, dest)
  }

  console.log('Done.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
