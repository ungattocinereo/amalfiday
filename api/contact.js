const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 6
const MIN_FORM_FILL_MS = 3500
const SPAM_WORDS_REGEX = /\b(casino|porn|viagra|forex|escort|betting)\b/i
const FIELD_LIMITS = {
  name: 80,
  contact: 120,
  dates: 160,
  service: 80,
  message: 2000,
}

const requestBuckets = new Map()

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const countLinks = (value) => (String(value || '').match(/https?:\/\/|www\./gi) || []).length

const isSpamText = (value) => {
  const text = String(value || '').trim()
  if (!text) return false
  if (SPAM_WORDS_REGEX.test(text)) return true
  if (countLinks(text) > 1) return true
  return /<a\s|<script|href=/i.test(text)
}

const withinLimit = (value, maxLength) => String(value || '').length <= maxLength

const takeRateLimitSlot = (ip) => {
  const now = Date.now()
  const bucket = requestBuckets.get(ip) || []
  const fresh = bucket.filter((entry) => now - entry < RATE_WINDOW_MS)

  if (fresh.length >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_WINDOW_MS - (now - fresh[0])
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  fresh.push(now)
  requestBuckets.set(ip, fresh)
  return { allowed: true, retryAfterSec: 0 }
}

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

  let payload = {}
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch (_error) {
    res.status(400).json({ error: 'Invalid JSON payload' })
    return
  }

  const headerValue = (key) => {
    const value = req.headers[key]
    if (!value) return ''
    return Array.isArray(value) ? value[0] : value
  }

  const payloadValue = (key) => {
    const value = payload?.[key]
    if (typeof value !== 'string') return ''
    return value.trim()
  }

  const pickValue = (...values) => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
    return ''
  }

  const forwardedFor = headerValue('x-forwarded-for')
  const ip =
    (forwardedFor ? forwardedFor.split(',')[0].trim() : '') ||
    headerValue('x-real-ip') ||
    headerValue('cf-connecting-ip') ||
    payloadValue('ip') ||
    req.socket?.remoteAddress ||
    'unknown'

  const honeypotValue = pickValue(
    payloadValue('company_website'),
    payloadValue('company'),
    payloadValue('website'),
  )
  if (honeypotValue) {
    res.status(200).json({ ok: true })
    return
  }

  const startedAtValue = Number(payload?._form_started_at ?? payload?.form_started_at)
  if (
    Number.isFinite(startedAtValue) &&
    startedAtValue > 0 &&
    Date.now() - startedAtValue < MIN_FORM_FILL_MS
  ) {
    res.status(200).json({ ok: true })
    return
  }

  const rate = takeRateLimitSlot(ip)
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfterSec))
    res.status(429).json({ error: 'Too many requests. Please try again later.' })
    return
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    res.status(500).json({ error: 'Missing Telegram credentials' })
    return
  }

  const name = payloadValue('name')
  const contact = payloadValue('contact')
  const dates = payloadValue('dates')
  const message = payloadValue('message')
  const service = payloadValue('service')

  if (!contact || !dates || !service) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  if (
    !withinLimit(name, FIELD_LIMITS.name) ||
    !withinLimit(contact, FIELD_LIMITS.contact) ||
    !withinLimit(dates, FIELD_LIMITS.dates) ||
    !withinLimit(service, FIELD_LIMITS.service) ||
    !withinLimit(message, FIELD_LIMITS.message)
  ) {
    res.status(400).json({ error: 'Invalid field length' })
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneDigits = contact.replace(/\D/g, '')
  if (!emailRegex.test(contact) && phoneDigits.length < 7) {
    res.status(400).json({ error: 'Invalid contact field' })
    return
  }

  if (countLinks(contact) > 0 || isSpamText(name) || isSpamText(dates) || isSpamText(message)) {
    res.status(400).json({ error: 'Rejected as spam' })
    return
  }

  const city = headerValue('x-vercel-ip-city') || headerValue('cf-ipcity')
  const region = headerValue('x-vercel-ip-country-region') || headerValue('x-vercel-ip-region')
  const country = headerValue('x-vercel-ip-country') || headerValue('cf-ipcountry')
  const latitude = headerValue('x-vercel-ip-latitude')
  const longitude = headerValue('x-vercel-ip-longitude')
  const payloadLocation = payloadValue('location')
  const payloadCoords = payloadValue('coords')
  const location = pickValue([city, region, country].filter(Boolean).join(', '), payloadLocation) || 'unknown'
  const coords =
    pickValue(latitude && longitude ? `${latitude}, ${longitude}` : '', payloadCoords) || 'unknown'
  const userAgent =
    pickValue(headerValue('user-agent'), payloadValue('userAgent'), payloadValue('user_agent')) ||
    'unknown'
  const referer =
    pickValue(headerValue('referer'), payloadValue('referrer'), payloadValue('referer'), payloadValue('page')) ||
    'unknown'
  const language =
    pickValue(headerValue('accept-language'), payloadValue('language'), payloadValue('locale')) ||
    'unknown'
  const timezone = payloadValue('timezone') || 'unknown'
  const timestamp = new Date().toISOString()

  const safeName = escapeHtml(name || '—')
  const safeContact = escapeHtml(contact)
  const safeDates = escapeHtml(dates)
  const safeService = escapeHtml(service)
  const safeMessage = escapeHtml(message || '—')

  const technicalLines = [
    `ip: ${ip}`,
    `location: ${location}`,
    `coords: ${coords}`,
    `user_agent: ${userAgent}`,
    `referrer: ${referer}`,
    `locale: ${language}`,
    `timezone: ${timezone}`,
    `time: ${timestamp}`,
  ].join('\n')

  const lines = [
    '📩 <b>New Amalfi.Day inquiry</b>',
    '',
    `👤 <b>Name:</b> ${safeName}`,
    `📞 <b>Contact:</b> ${safeContact}`,
    `🧭 <b>Service:</b> ${safeService}`,
    `📅 <b>Dates & location:</b> ${safeDates}`,
    `💬 <b>Message:</b> ${safeMessage}`,
    '',
    '🧾 <b>Technical</b>',
    `<pre>${escapeHtml(technicalLines)}</pre>`,
  ].join('\n')

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      res.status(502).json({ error: 'Telegram request failed', details: details.slice(0, 200) })
      return
    }

    res.status(200).json({ ok: true })
  } catch (_error) {
    res.status(500).json({ error: 'Telegram request failed' })
  }
}
