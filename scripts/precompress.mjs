import fs from 'node:fs/promises'
import path from 'node:path'
import { brotliCompress, constants as zlibConstants, gzip } from 'node:zlib'
import { promisify } from 'node:util'

const brotli = promisify(brotliCompress)
const gz = promisify(gzip)

const distDir = path.resolve(process.argv[2] || 'dist')
const compressExtensions = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.svg',
  '.xml',
  '.txt',
  '.ico',
  '.map',
  '.webmanifest',
])

const brotliOptions = {
  params: {
    [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
  },
}

const shouldCompress = (filePath) => {
  const ext = path.extname(filePath)
  return compressExtensions.has(ext)
}

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
    } else if (!entry.name.endsWith('.br') && !entry.name.endsWith('.gz')) {
      files.push(fullPath)
    }
  }

  return files
}

const compressFile = async (filePath) => {
  if (!shouldCompress(filePath)) return

  const content = await fs.readFile(filePath)
  const brPath = `${filePath}.br`
  const gzPath = `${filePath}.gz`

  const [br, gzipped] = await Promise.all([
    brotli(content, brotliOptions),
    gz(content, { level: 9 }),
  ])

  await Promise.all([fs.writeFile(brPath, br), fs.writeFile(gzPath, gzipped)])
}

const main = async () => {
  try {
    const stat = await fs.stat(distDir)
    if (!stat.isDirectory()) throw new Error('dist is not a directory')
  } catch (error) {
    console.error(`Missing dist directory: ${distDir}`)
    process.exit(1)
  }

  const files = await walk(distDir)
  await Promise.all(files.map((file) => compressFile(file)))
  console.log(`Precompressed ${files.length} files with Brotli/Gzip.`)
}

main()
