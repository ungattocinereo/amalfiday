// Pure URL → contact form prefill. No DOM access: the page script writes the returned
// strings into input.value / textarea.value only, so nothing is ever parsed as HTML.
import { getDirectUnit } from '../data/direct-units.mjs'

// Short URL tokens → the exact labels of the form's service select options.
export const SERVICE_BY_TOKEN = Object.freeze({
  photoshoot: 'Photoshooting',
  apartment: 'Apartment',
  tour: 'Tour',
})

// Labels of the select options. Legacy links use them directly (?service=Photoshooting).
export const SERVICE_LABELS = Object.freeze(['Porters/taxi', 'Photoshooting', 'Apartment', 'Tour', 'Other'])

const MAX_DATES = 120
const MAX_MESSAGE = 500

// Single-line, printable text: control characters and angle brackets removed, spaces collapsed.
function cleanLine(value, max) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function cleanMessage(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/g, ' ')
    .trim()
    .slice(0, MAX_MESSAGE)
}

export function resolveService(raw) {
  if (typeof raw !== 'string') return null
  const key = raw.trim().toLowerCase()
  if (!key) return null
  if (Object.hasOwn(SERVICE_BY_TOKEN, key)) return SERVICE_BY_TOKEN[key]
  return SERVICE_LABELS.find((label) => label.toLowerCase() === key) ?? null
}

/**
 * @param {string | URLSearchParams} search  location.search or its params
 * @returns {{ service: string|null, unit: {id:string,label:string}|null, dates: string, message: string }}
 */
export function contactPrefill(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(String(search ?? ''))

  let service = resolveService(params.get('service'))

  const unitId = params.get('unit')
  const direct = typeof unitId === 'string' ? getDirectUnit(unitId.trim()) : null
  const unit = direct ? { id: unitId.trim(), label: direct.label } : null
  if (unit && !service) service = SERVICE_BY_TOKEN.apartment

  const dates = cleanLine(params.get('dates') ?? '', MAX_DATES)

  let message = cleanMessage(params.get('message') ?? '')
  if (!message && unit) message = `I'd like to book ${unit.label}.`

  return { service, unit, dates, message }
}
