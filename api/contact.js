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

  if (!name || !contact || !message) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const lines = [
    'New Amalfi.Day inquiry',
    '',
    `Name: ${name}`,
    `Contact: ${contact}`,
    service ? `Service: ${service}` : null,
    dates ? `Dates/Location: ${dates}` : null,
    `Message: ${message}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines }),
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
