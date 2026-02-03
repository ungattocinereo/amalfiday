import type { APIRoute } from 'astro'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData()
  const name = String(formData.get('name') || '')
  const contact = String(formData.get('contact') || '')
  const dates = String(formData.get('dates') || '')
  const message = String(formData.get('message') || '')

  const token = import.meta.env.TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing Telegram config' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const text = [
    'New Amalfi.Day inquiry',
    `Name: ${name}`,
    `Contact: ${contact}`,
    dates ? `Dates/Location: ${dates}` : null,
    `Message: ${message}`,
  ]
    .filter(Boolean)
    .join('\n')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
