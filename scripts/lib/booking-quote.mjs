// Pure stay quote: price and booking rules for the direct booking site.
// No I/O. Dates are `YYYY-MM-DD` strings (Europe/Rome calendar days); money is integer cents.

const MIN_STAY_NIGHTS = 2
const CITY_TAX_CENTS_PER_GUEST_NIGHT = 250
const FREE_CANCELLATION_DAYS = 7
const CHARGE_DAYS_BEFORE = 9
const DAY_MS = 86_400_000

const romeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Rome',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function romeToday(now = new Date()) {
  const parts = Object.fromEntries(romeFormatter.formatToParts(now).map((p) => [p.type, p.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

function toUtcMs(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const [y, m, d] = date.split('-').map(Number)
  const ms = Date.UTC(y, m - 1, d)
  return new Date(ms).toISOString().slice(0, 10) === date ? ms : null
}

export function addDays(date, n) {
  const ms = toUtcMs(date)
  if (ms === null) throw new RangeError(`Invalid date: ${date}`)
  return new Date(ms + n * DAY_MS).toISOString().slice(0, 10)
}

const refuse = (reason, extra) => ({ ok: false, reason, ...extra })

export function quoteStay({ nights, checkIn, checkOut, guests, maxGuests, discountPct, today }) {
  // Caller bugs, not guest input: never quote a NaN or negative total.
  if (!Number.isInteger(discountPct) || discountPct < 0 || discountPct > 100) {
    throw new RangeError(`Invalid discountPct: ${discountPct}`)
  }
  if (!Number.isInteger(maxGuests) || maxGuests < 1) {
    throw new RangeError(`Invalid maxGuests: ${maxGuests}`)
  }
  const inMs = toUtcMs(checkIn)
  const outMs = toUtcMs(checkOut)
  if (inMs === null || outMs === null || toUtcMs(today) === null || outMs <= inMs) return refuse('invalid_dates')
  if (checkIn < today) return refuse('past')
  if (!Number.isInteger(guests) || guests < 1 || guests > maxGuests) return refuse('too_many_guests')

  const byDate = new Map(nights.map((n) => [n.date, n]))
  const stayNights = Math.round((outMs - inMs) / DAY_MS)
  const arrival = byDate.get(checkIn)

  const arrivalMinStay = Number.isInteger(arrival?.minStay) ? arrival.minStay : 0
  const minStay = Math.max(MIN_STAY_NIGHTS, arrivalMinStay)
  if (stayNights < minStay) return refuse('min_stay', { minStay })

  if (arrival?.closedOnArrival) return refuse('closed_arrival')

  const perNight = []
  for (let i = 0; i < stayNights; i++) {
    const date = addDays(checkIn, i)
    const n = byDate.get(date)
    if (!n || n.bookable !== true || !Number.isInteger(n.priceCents) || n.priceCents <= 0) return refuse('unavailable')
    perNight.push({ date, priceCents: n.priceCents })
  }

  if (byDate.get(checkOut)?.closedOnDeparture) return refuse('closed_departure')

  const subtotalCents = perNight.reduce((sum, n) => sum + n.priceCents, 0)
  const discountCents = Math.round((subtotalCents * discountPct) / 100)
  const freeCancellationUntil = addDays(checkIn, -FREE_CANCELLATION_DAYS)
  const chargeDate = addDays(checkIn, -CHARGE_DAYS_BEFORE)

  return {
    ok: true,
    nights: stayNights,
    perNight,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
    cityTaxCents: CITY_TAX_CENTS_PER_GUEST_NIGHT * guests * stayNights,
    freeCancellationUntil,
    chargeDate,
    payNow: today >= chargeDate,
    refundable: today <= freeCancellationUntil,
  }
}
