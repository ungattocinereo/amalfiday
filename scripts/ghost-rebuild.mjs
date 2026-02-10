/**
 * Ghost Webhook → Rebuild listener.
 *
 * Receives POST from Ghost and runs `npm run build:static`
 * to regenerate the static site in /home/greg/amalfiday.
 *
 * Ghost Admin → Settings → Integrations → Add webhook:
 *   Event:  Site changed (rebuild all)  — or —  Post published / Post updated
 *   URL:    http://host.docker.internal:4400/rebuild
 *   Secret: <GHOST_WEBHOOK_SECRET>
 *
 * Auth: Ghost HMAC-SHA256 via x-ghost-signature header,
 *       or ?secret= query param for manual curl testing.
 *
 * Run:
 *   GHOST_WEBHOOK_SECRET=mysecret node scripts/ghost-rebuild.mjs
 *
 * Or via systemd — see docs/ghost-webhook.md
 */

import http from 'node:http'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'

const PROJECT_ROOT = '/home/greg/amalfiday'
const PORT = Number(process.env.REBUILD_PORT || 4400)
const SECRET = process.env.GHOST_WEBHOOK_SECRET || ''

let building = false

const rebuild = () => {
  if (building) {
    console.log('[ghost-rebuild] build already running, skipping')
    return
  }

  building = true
  const start = Date.now()
  console.log(`[ghost-rebuild] build started at ${new Date().toISOString()}`)

  execFile('npm', ['run', 'build:static'], { cwd: PROJECT_ROOT, timeout: 300_000 }, (err, stdout, stderr) => {
    building = false
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    if (err) {
      console.error(`[ghost-rebuild] build FAILED after ${elapsed}s`)
      console.error(stderr || err.message)
      return
    }

    console.log(`[ghost-rebuild] build OK in ${elapsed}s`)
  })
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method !== 'POST' || url.pathname !== '/rebuild') {
    res.writeHead(404)
    res.end('Not Found')
    return
  }

  // Collect request body for HMAC verification
  const chunks = []
  req.on('data', (chunk) => chunks.push(chunk))
  req.on('end', () => {
    const body = Buffer.concat(chunks)

    if (SECRET) {
      // Ghost sends HMAC-SHA256 signature in x-ghost-signature header:
      //   "sha256=HEX_SIGNATURE, t=TIMESTAMP"
      // Also support ?secret= query param for manual curl testing
      const querySecret = url.searchParams.get('secret')
      const ghostSig = req.headers['x-ghost-signature']

      let authorized = false

      if (querySecret === SECRET) {
        authorized = true
      } else if (ghostSig) {
        const match = ghostSig.match(/sha256=([a-f0-9]+)/i)
        if (match) {
          const expected = crypto
            .createHmac('sha256', SECRET)
            .update(body)
            .digest('hex')
          authorized = match[1] === expected
        }
      }

      if (!authorized) {
        console.log(`[ghost-rebuild] 401 — invalid secret or signature`)
        res.writeHead(401)
        res.end('Unauthorized')
        return
      }
    }

    handleRebuild(res)
  })

  function handleRebuild(res) {
    if (building) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, status: 'already_building' }))
      return
    }

    rebuild()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, status: 'build_started' }))
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ghost-rebuild] listening on http://0.0.0.0:${PORT}/rebuild`)
  if (!SECRET) console.log('[ghost-rebuild] WARNING: no GHOST_WEBHOOK_SECRET, set it for security')
})
