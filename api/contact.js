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

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    res.status(500).json({ error: 'Missing Telegram credentials' })
    return
  }

  let payload = {}

  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON payload' })
    return
  }

  const { name, contact, dates, message, service } = payload

  if (!contact || !dates || !service) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const headerValue = (key) => {
    const value = req.headers[key]
    if (!value) return ''
    return Array.isArray(value) ? value[0] : value
  }

  const forwardedFor = headerValue('x-forwarded-for')
  const ip =
    (forwardedFor ? forwardedFor.split(',')[0].trim() : '') ||
    headerValue('x-real-ip') ||
    headerValue('cf-connecting-ip') ||
    req.socket?.remoteAddress ||
    'unknown'
  const city = headerValue('x-vercel-ip-city') || headerValue('cf-ipcity')
  const region = headerValue('x-vercel-ip-country-region') || headerValue('x-vercel-ip-region')
  const country = headerValue('x-vercel-ip-country') || headerValue('cf-ipcountry')
  const latitude = headerValue('x-vercel-ip-latitude')
  const longitude = headerValue('x-vercel-ip-longitude')
  const location = [city, region, country].filter(Boolean).join(', ') || 'unknown'
  const coords = latitude && longitude ? `${latitude}, ${longitude}` : 'unknown'
  const userAgent = headerValue('user-agent') || 'unknown'
  const referer = headerValue('referer') || 'unknown'
  const language = headerValue('accept-language') || 'unknown'
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
  } catch (error) {
    res.status(500).json({ error: 'Telegram request failed' })
  }
}
