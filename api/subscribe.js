import crypto from 'node:crypto'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const adminKey = process.env.GHOST_ADMIN_API_KEY
  const ghostUrl = process.env.GHOST_API_URL

  if (!adminKey || !ghostUrl) {
    res.status(500).json({ error: 'Missing Ghost credentials' })
    return
  }

  let payload = {}
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    res.status(400).json({ error: 'Invalid JSON' })
    return
  }

  const { email, hp, t } = payload

  // Honeypot check — bots fill hidden fields
  if (hp) {
    // Pretend success so bots don't retry
    res.status(200).json({ ok: true })
    return
  }

  // Timing check — form must exist >2s before submission
  if (t && Date.now() - Number(t) < 2000) {
    res.status(200).json({ ok: true })
    return
  }

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  const trimmed = email.trim().toLowerCase()

  // Server-side email validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(trimmed)) {
    res.status(400).json({ error: 'Invalid email address' })
    return
  }

  try {
    const token = makeGhostAdminToken(adminKey)
    const baseUrl = ghostUrl.replace(/\/+$/, '')

    const response = await fetch(`${baseUrl}/ghost/api/admin/members/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Ghost ${token}`,
      },
      body: JSON.stringify({
        members: [{ email: trimmed }],
      }),
    })

    if (response.ok) {
      res.status(200).json({ ok: true })
      return
    }

    const body = await response.json().catch(() => ({}))
    const errors = body.errors || []

    // Member already exists — treat as success (per requirements)
    const alreadyExists = errors.some(
      (e) => e.type === 'ValidationError' && /member/i.test(e.message),
    )
    if (alreadyExists) {
      res.status(200).json({ ok: true })
      return
    }

    res.status(502).json({ error: 'Ghost API error', details: JSON.stringify(errors).slice(0, 300) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create member' })
  }
}

/**
 * Create a short-lived JWT for Ghost Admin API authentication.
 * Ghost Admin API keys are in the format `id:secret` where the secret is hex-encoded.
 */
function makeGhostAdminToken(adminKey) {
  const [id, secret] = adminKey.split(':')
  const key = Buffer.from(secret, 'hex')

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT', kid: id }
  const payload = {
    iat: now,
    exp: now + 300, // 5 min
    aud: '/admin/',
  }

  const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const input = `${enc(header)}.${enc(payload)}`
  const signature = crypto.createHmac('sha256', key).update(input).digest('base64url')

  return `${input}.${signature}`
}
