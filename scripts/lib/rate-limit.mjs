// Small in-memory per-key rate limiter (sliding log), modelled on the one in api/contact.js.
// Best-effort per instance: each serverless instance has its own memory, so a Vercel Firewall
// rate-limit rule is the real guard.

export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }) {
  const buckets = new Map()
  let lastPrune = -Infinity

  function prune(now) {
    for (const [key, stamps] of buckets) {
      if (now - stamps[stamps.length - 1] >= windowMs) buckets.delete(key)
    }
    lastPrune = now
  }

  function take(key, now = Date.now()) {
    if (now - lastPrune >= windowMs || buckets.size >= maxKeys) prune(now)
    const fresh = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
    if (fresh.length >= limit) {
      buckets.set(key, fresh)
      const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - fresh[0])) / 1000))
      return { allowed: false, retryAfterSec }
    }
    fresh.push(now)
    // Re-insert so Map order is least-recently-used first; evict the oldest key when full.
    buckets.delete(key)
    while (buckets.size >= maxKeys) buckets.delete(buckets.keys().next().value)
    buckets.set(key, fresh)
    return { allowed: true, retryAfterSec: 0 }
  }

  return {
    limit,
    windowMs,
    take,
    reset() {
      buckets.clear()
      lastPrune = -Infinity
    },
    get size() {
      return buckets.size
    },
  }
}

// Client IP as in api/contact.js (minus the body field). Never logged.
export function clientIp(req) {
  const header = (key) => {
    const value = req?.headers?.[key]
    if (!value) return ''
    return (Array.isArray(value) ? value[0] : value).trim()
  }
  const forwardedFor = header('x-forwarded-for')
  return (
    (forwardedFor ? forwardedFor.split(',')[0].trim() : '') ||
    header('x-real-ip') ||
    header('cf-connecting-ip') ||
    req?.socket?.remoteAddress ||
    'unknown'
  )
}
