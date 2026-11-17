// Pure "Plan your day" request → /api/contact payload. No DOM access, so it runs in tests.
// The API contract is fixed: name, contact, dates, service, message + honeypot company_website.
// contact, dates and service are required; guests, room and extra services are folded into
// service and message.
import { getDirectUnit } from '../data/direct-units.mjs'

// Server limits (api/contact.js FIELD_LIMITS).
export const LIMITS = Object.freeze({ name: 80, contact: 120, dates: 160, service: 80, message: 2000 })

// Tiles of step 1, in display order. `label` is what lands in Telegram.
export const SERVICES = Object.freeze([
  Object.freeze({ id: 'photoshoot', label: 'Photoshoot' }),
  Object.freeze({ id: 'stay', label: 'Stay' }),
  Object.freeze({ id: 'tour', label: 'Tour' }),
  Object.freeze({ id: 'other', label: 'Question' }),
])

export const MAX_GUESTS = 12

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 86_400_000

function line(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
}

function text(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim()
}

// Cut to `max` characters, ending with an ellipsis when something was dropped.
function clip(value, max) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`
}

/** 'YYYY-MM-DD' → { y, m, d, t } (t = UTC ms), or null when it is not a real date. */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof value === 'string' ? value.trim() : '')
  if (!match) return null
  const [y, m, d] = match.slice(1).map(Number)
  const t = Date.UTC(y, m - 1, d)
  const back = new Date(t)
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null
  return { y, m, d, t }
}

const fmt = (p, withYear = true) => `${p.d} ${MONTHS[p.m - 1]}${withYear ? ` ${p.y}` : ''}`

/**
 * Human date range: "12 Jun 2027", "12 Jun – 15 Jun 2027 (3 nights)".
 * Returns '' when `from` is missing or invalid; ignores a `to` that is not after `from`.
 */
export function formatDateRange(from, to) {
  const a = parseIsoDate(from)
  if (!a) return ''
  const b = parseIsoDate(to)
  if (!b || b.t <= a.t) return fmt(a)
  const nights = Math.round((b.t - a.t) / DAY_MS)
  return `${fmt(a, a.y !== b.y)} – ${fmt(b)} (${nights} night${nights === 1 ? '' : 's'})`
}

export function isValidContact(value) {
  const v = line(value)
  if (!v) return false
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true
  return v.replace(/\D/g, '').length >= 7 && !/[a-z]/i.test(v.replace(/^whatsapp:?/i, ''))
}

/** Known service ids only, in tile order, no duplicates. */
export function normalizeServices(ids) {
  const set = new Set(Array.isArray(ids) ? ids : [])
  return SERVICES.filter((s) => set.has(s.id))
}

/** "Ask" on its own: a plain question, so no dates or guests are needed. */
export function isAskOnly(ids) {
  const services = normalizeServices(ids)
  return services.length === 1 && services[0].id === 'other'
}

export function clampGuests(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, MAX_GUESTS)
}

/**
 * @param {object} input
 * @param {string[]} input.services   tile ids
 * @param {string} [input.from]       YYYY-MM-DD
 * @param {string} [input.to]         YYYY-MM-DD
 * @param {string} [input.place]      place or flexible dates, free text
 * @param {number|string} [input.guests]
 * @param {string} [input.unit]       direct-units id, only used with Stay
 * @param {string} [input.name]
 * @param {string} [input.contact]
 * @param {string} [input.message]
 * @param {string} [input.honeypot]
 * @returns {{ ok: boolean, errors: Record<string,string>, payload: object, summary: object }}
 */
export function buildContactRequest(input = {}) {
  const services = normalizeServices(input.services)
  const hasStay = services.some((s) => s.id === 'stay')
  const guests = clampGuests(input.guests ?? 1)
  const unitEntry = hasStay && typeof input.unit === 'string' ? getDirectUnit(input.unit) : null
  const unit = unitEntry && unitEntry.maxGuests >= guests ? unitEntry : null
  const range = formatDateRange(input.from, input.to)
  const place = line(input.place)
  const name = line(input.name)
  const contact = line(input.contact)
  const note = text(input.message)

  const askOnly = services.length === 1 && services[0].id === 'other'

  const errors = {}
  if (!services.length) errors.services = 'Pick at least one option.'
  const from = parseIsoDate(input.from)
  const to = parseIsoDate(input.to)
  if (from && to && to.t <= from.t) errors.to = 'The end date must be after the start date.'
  if (!range && !place && !askOnly) errors.dates = 'Add a date, or tell us roughly when.'
  if (askOnly && !note) errors.message = 'Write your question.'
  if (!contact) errors.contact = 'Add your email or WhatsApp number.'
  else if (!isValidContact(contact)) errors.contact = 'This does not look like an email or phone number.'
  else if (contact.length > LIMITS.contact) errors.contact = 'This is too long for an email or phone number.'

  const guestLabel = `${guests} guest${guests === 1 ? '' : 's'}`
  const serviceText = services.map((s) => s.label).join(' + ')
  const service = clip(askOnly ? serviceText : serviceText ? `${serviceText} · ${guestLabel}` : '', LIMITS.service)
  // The API requires dates; a plain question has none.
  const dates = clip([range, place].filter(Boolean).join(', ') || (askOnly ? 'Not specified' : ''), LIMITS.dates)

  const details = []
  if (services.length > 1) details.push(`Services: ${services.map((s) => s.label).join(', ')}`)
  if (!askOnly) details.push(`Guests: ${guests}`)
  if (hasStay) details.push(`Room: ${unit ? unit.label : 'any room'}`)
  if (range) details.push(`Dates: ${range}`)
  if (place) details.push(`Place / timing: ${place}`)
  const head = details.join('\n')
  const room = LIMITS.message - head.length - 2
  const message = !head ? note : note ? `${head}\n\n${clip(note, Math.max(room, 0))}` : head

  const payload = {
    name: clip(name, LIMITS.name),
    contact,
    dates,
    service,
    message: clip(message, LIMITS.message),
    company_website: typeof input.honeypot === 'string' ? input.honeypot : '',
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    payload,
    summary: {
      services: services.map((s) => s.label),
      dates: range,
      place,
      guests: askOnly ? '' : guestLabel,
      room: hasStay ? (unit ? unit.label : 'Any room') : '',
      name,
      contact,
    },
  }
}

/** Short text for a WhatsApp follow-up link (wa.me/?text=). */
export function whatsappText(summary) {
  const parts = ['Hi! I just sent a request on amalfi.day']
  if (summary?.services?.length) parts.push(`: ${summary.services.join(' + ')}`)
  const when = [summary?.dates, summary?.place].filter(Boolean).join(', ')
  if (when) parts.push(`, ${when}`)
  return `${parts.join('')}.`
}
