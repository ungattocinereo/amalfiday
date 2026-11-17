// Pure helpers for the "Book direct" block on /apartments.
// No DOM, no fetch: imported by the page script and by `node --test`.
// Data shape: GET /api/booking/calendar → units[id] = { maxGuests, nights: [{ d, b, p, m }] },
// `p` is the pre-discount nightly price in integer cents.

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CITY_TAX_CENTS_PER_PERSON_NIGHT = 250

export function isIsoDate(value) {
  if (typeof value !== 'string') return false
  const m = ISO_RE.exec(value)
  if (!m) return false
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return date.toISOString().slice(0, 10) === value
}

export function addDaysIso(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

export function nightsBetween(from, to) {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)
  return Math.round(ms / 86400000)
}

export function cityTaxCents(guests, nights) {
  return CITY_TAX_CENTS_PER_PERSON_NIGHT * guests * nights
}

// Same rule as the server's quoteStay.
export function discounted(fullCents, discountPct) {
  return fullCents - Math.round((fullCents * discountPct) / 100)
}

const isOpen = (night) => night && night.b === 1

// Runs of consecutive open nights; `to` is the last open night (inclusive).
export function openWindows(nights) {
  const windows = []
  let current = null
  for (const night of nights) {
    if (!isOpen(night)) {
      current = null
      continue
    }
    if (current && addDaysIso(current.to, 1) === night.d) {
      current.to = night.d
    } else {
      current = { from: night.d, to: night.d }
      windows.push(current)
    }
  }
  return windows
}

export function unitState(unit, { from, to, guests, discountPct }) {
  if (!from || !to) {
    const prices = unit.nights.filter((n) => isOpen(n) && typeof n.p === 'number').map((n) => n.p)
    return {
      state: 'idle',
      fromCents: prices.length ? discounted(Math.min(...prices), discountPct) : undefined,
      nextWindow: openWindows(unit.nights)[0],
    }
  }

  const byDate = new Map(unit.nights.map((n) => [n.d, n]))
  const count = nightsBetween(from, to)
  const stay = []
  for (let i = 0; i < count; i++) stay.push(byDate.get(addDaysIso(from, i)))

  const bookable = stay.length > 0 && stay.every((n) => isOpen(n) && typeof n.p === 'number')
  const arrival = byDate.get(from)
  const minStay = arrival && typeof arrival.m === 'number' ? arrival.m : 1
  const fullCents = bookable ? stay.reduce((sum, n) => sum + n.p, 0) : 0
  const totals = { fullCents, totalCents: discounted(fullCents, discountPct), nights: count }

  if (guests > unit.maxGuests) {
    return bookable && count >= minStay ? { state: 'guests', ...totals } : { state: 'guests' }
  }
  if (count < minStay) return { state: 'min_stay', minStay }
  if (!bookable) return { state: 'unavailable' }
  return { state: 'available', ...totals }
}

export function selectableDates(units) {
  const dates = new Set()
  for (const unit of Object.values(units)) {
    for (const night of unit.nights) if (isOpen(night)) dates.add(night.d)
  }
  return dates
}

export function queryString({ from, to, guests } = {}) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (guests) params.set('guests', String(guests))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function bookUrl(id, params = {}) {
  return `/book/${id}/${queryString(params)}`
}

const STATE_ORDER = { available: 0, guests: 1, min_stay: 2, unavailable: 3 }

// Stable: keeps the given order inside each state group.
export function sortByState(ids, states) {
  const rank = (id) => STATE_ORDER[states[id]] ?? 4
  return ids
    .map((id, index) => ({ id, index }))
    .sort((a, b) => rank(a.id) - rank(b.id) || a.index - b.index)
    .map(({ id }) => id)
}

// Reads ?from&to&guests; invalid values are dropped silently.
export function parseQuery(search, bounds) {
  const params = new URLSearchParams(search || '')
  const inBounds = (d) => !bounds || (d >= bounds.today && d <= bounds.horizon)
  const out = {}
  const from = params.get('from')
  const to = params.get('to')
  if (isIsoDate(from) && inBounds(from)) out.from = from
  if (isIsoDate(to) && inBounds(to) && (!out.from || to > out.from)) out.to = to
  const guests = params.get('guests')
  if (guests === '1' || guests === '2') out.guests = Number(guests)
  return out
}

function euro(cents, decimals) {
  const value = (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `€${value}`
}

// "€75" for whole euros, "€74.70" otherwise.
export function formatEuro(cents) {
  return euro(cents, cents % 100 === 0 ? 0 : 2)
}

// Totals always carry two decimals: "€149.40".
export function formatEuroTotal(cents) {
  return euro(cents, 2)
}

function dayMonth(iso) {
  const [, m, d] = iso.split('-').map(Number)
  return { day: d, month: MONTHS[m - 1] }
}

export function formatDate(iso) {
  const { day, month } = dayMonth(iso)
  return `${day} ${month}`
}

// "15 Dec – 8 Jan", or "20–22 Dec" within one month.
export function formatRange(from, to) {
  if (from === to) return formatDate(from)
  const a = dayMonth(from)
  const b = dayMonth(to)
  if (from.slice(0, 7) === to.slice(0, 7)) return `${a.day}–${b.day} ${b.month}`
  return `${formatDate(from)} – ${formatDate(to)}`
}
