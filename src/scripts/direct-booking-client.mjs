// Pure helpers for the "Book direct" block on /apartments and the /book/<id>/ panel.
// No DOM, no fetch: imported by the page scripts and by `node --test`.
// Data shape: GET /api/booking/calendar → units[id] = { maxGuests, nights: [{ d, b, p, m, a?, x? }] },
// `p` is the pre-discount nightly price in integer cents; `a: 1` closed on arrival, `x: 1` closed on departure.

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CITY_TAX_CENTS_PER_PERSON_NIGHT = 250
// Same cap as the quote endpoint (longer stays are a 400 there).
const MAX_STAY_NIGHTS = 30

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
  // Same refusals as the server's quoteStay: closed on arrival / closed on departure.
  const restricted = arrival?.a === 1 || byDate.get(to)?.x === 1

  if (guests > unit.maxGuests) {
    return bookable && !restricted && count >= minStay ? { state: 'guests', ...totals } : { state: 'guests' }
  }
  if (count < minStay) return { state: 'min_stay', minStay }
  if (!bookable || restricted) return { state: 'unavailable' }
  return { state: 'available', ...totals }
}

// The quote endpoint refuses stays over 30 nights; the panel says so before asking.
export function stayTooLong(from, to) {
  if (!isIsoDate(from) || !isIsoDate(to)) return false
  return nightsBetween(from, to) > MAX_STAY_NIGHTS
}

// Smallest minStay when every unit's state is min_stay; null otherwise (or when there are none).
export function minStayOnly(states) {
  const list = Object.values(states)
  if (list.length === 0 || !list.every((s) => s?.state === 'min_stay')) return null
  return Math.min(...list.map((s) => s.minStay))
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

// ---- /book/<id>/ panel: every number below is read from the server quote ----
// Quote shape: GET /api/booking/quote → { checkIn, checkOut, guests, ok, nights,
// perNight: [{ date, priceCents }], subtotalCents, discountCents, totalCents, cityTaxCents,
// freeCancellationUntil, chargeDate, payNow, refundable, discountPct } or { ok: false, reason, minStay? }.

// Contact form `service` option for stays (src/pages/contact.astro, data-value).
const CONTACT_SERVICE = 'Apartment'

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// "13 Dec 2026"
export function formatDateLong(iso) {
  return `${formatDate(iso)} ${iso.slice(0, 4)}`
}

// "20 Dec – 22 Dec 2026", or "28 Dec 2026 – 3 Jan 2027" across years.
export function formatStayRange(from, to) {
  if (from.slice(0, 4) === to.slice(0, 4)) return `${formatDate(from)} – ${formatDateLong(to)}`
  return `${formatDateLong(from)} – ${formatDateLong(to)}`
}

// "20 Dec – 22 Dec 2026 · 2 nights · 2 guests"
export function stayLine(quote) {
  return [
    formatStayRange(quote.checkIn, quote.checkOut),
    plural(quote.nights, 'night'),
    plural(quote.guests, 'guest'),
  ].join(' · ')
}

// Rows of the price block: runs of consecutive nights at one price, discount, total, city tax.
export function priceLines(quote) {
  const runs = []
  for (const { priceCents } of quote.perNight) {
    const last = runs[runs.length - 1]
    if (last && last.priceCents === priceCents) last.count += 1
    else runs.push({ priceCents, count: 1 })
  }
  const derivedPct = quote.subtotalCents > 0 ? Math.round((quote.discountCents / quote.subtotalCents) * 100) : 0
  const pct = Number.isInteger(quote.discountPct) ? quote.discountPct : derivedPct
  const taxNights = quote.guests * quote.nights
  const taxRate = taxNights > 0 ? Math.round(quote.cityTaxCents / taxNights) : 0
  return {
    runs: runs.map(({ priceCents, count }) => ({
      label: `${formatEuro(priceCents)} × ${plural(count, 'night')}`,
      amount: formatEuroTotal(priceCents * count),
    })),
    discount:
      quote.discountCents > 0
        ? { label: `Direct booking discount −${pct}%`, amount: `−${formatEuroTotal(quote.discountCents)}` }
        : null,
    total: { label: 'Total', amount: formatEuroTotal(quote.totalCents) },
    cityTax: {
      label: `City tax, paid on arrival (${formatEuroTotal(taxRate)} × ${plural(quote.guests, 'guest')} × ${plural(quote.nights, 'night')})`,
      amount: formatEuroTotal(quote.cityTaxCents),
    },
  }
}

// mode: 'request' (the guest sends a request; we confirm by message) or 'instant' (online payment).
export function policyText(quote, mode = 'instant') {
  if (mode === 'request') {
    const due = 'Payment is due on confirmation.'
    if (!quote.refundable) {
      return `Once we confirm your request, the booking is non-refundable, except where the law provides otherwise. ${due}`
    }
    const until = `Once we confirm your request: free cancellation until ${formatDateLong(quote.freeCancellationUntil)}`
    if (quote.payNow) return `${until}. ${due}`
    return `${until}, and payment is due on ${formatDateLong(quote.chargeDate)}. You pay nothing now.`
  }
  if (!quote.refundable) return 'This booking is non-refundable, except where the law provides otherwise.'
  const until = `Free cancellation until ${formatDateLong(quote.freeCancellationUntil)}.`
  if (quote.payNow) return `${until} Payment is taken at booking.`
  return `${until} You pay nothing today: your card is charged on ${formatDateLong(quote.chargeDate)}.`
}

// Guest-facing text for an ok:false quote; null when the quote is bookable.
export function quoteMessage(quote, maxGuests) {
  if (quote.ok) return null
  switch (quote.reason) {
    case 'min_stay':
      return `Minimum stay is ${quote.minStay} nights for these dates.`
    case 'too_many_guests':
      return `This stay is for up to ${plural(maxGuests, 'guest')}.`
    case 'unavailable':
      return 'These dates are not available. Try other dates.'
    case 'closed_arrival':
      return 'Check-in is not possible on this day.'
    case 'closed_departure':
      return 'Check-out is not possible on this day.'
    default:
      return 'Please choose valid dates.'
  }
}

// "Request to book" → the contact form, prefilled. Values are plain text, encoded by URLSearchParams.
export function requestUrl(apartmentName, quote) {
  const range = formatStayRange(quote.checkIn, quote.checkOut)
  const params = new URLSearchParams()
  params.set('service', CONTACT_SERVICE)
  params.set('dates', `${range}, ${apartmentName}`)
  params.set(
    'message',
    `Direct booking request: ${apartmentName}, ${range}, ${plural(quote.nights, 'night')}, ${plural(quote.guests, 'guest')}. ` +
      `Total ${formatEuroTotal(quote.totalCents)} + ${formatEuroTotal(quote.cityTaxCents)} city tax on arrival.`,
  )
  return `/contact/?${params.toString()}`
}

// Screen-reader summary of a bookable quote: "Total €149.40 for 2 nights."
export function quoteSummary(quote) {
  return `Total ${formatEuroTotal(quote.totalCents)} for ${plural(quote.nights, 'night')}.`
}

// Guests from the query string, kept within 1..maxGuests; undefined stays undefined.
export function clampGuests(guests, maxGuests) {
  if (guests === undefined) return undefined
  return Math.min(Math.max(1, guests), maxGuests)
}
