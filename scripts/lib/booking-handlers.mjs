// Read-only booking endpoints: calendar and quote. Pure async handlers returning
// { status, headers, body }; api/booking/*.js and the dev server are thin wrappers.
// Prices, discount and guest limits are decided here, never by browser parameters.

import { DIRECT_UNIT_IDS, getDirectUnit } from '../../src/data/direct-units.mjs'
import { quoteStay, romeToday, addDays } from './booking-quote.mjs'
import { loadNights } from './hostex-read.mjs'
import { createRateLimiter, clientIp } from './rate-limit.mjs'

const MIN_STAY_NIGHTS = 2
const HORIZON_DAYS = 365
const MAX_STAY_NIGHTS = 30
const DEFAULT_DISCOUNT_PCT = 10
const MAX_DISCOUNT_PCT = 50
const DAY_MS = 86_400_000
const RATE_WINDOW_MS = 60_000

// Per-IP limits. Production is one long-lived Node process behind Caddy, so these hold across requests.
export const bookingRateLimiters = {
  quote: createRateLimiter({ limit: 30, windowMs: RATE_WINDOW_MS }),
  calendar: createRateLimiter({ limit: 20, windowMs: RATE_WINDOW_MS }),
}

const NO_STORE = { 'Cache-Control': 'no-store' }
const CALENDAR_CACHE = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }

const reply = (status, body, headers = NO_STORE) => ({ status, headers: { ...headers }, body })
const fail = (status, error) => reply(status, { error })

class Unavailable extends Error {}

function discountPct(env) {
  const raw = env.DIRECT_DISCOUNT_PCT
  if (typeof raw !== 'string' || !/^\d{1,2}$/.test(raw)) return DEFAULT_DISCOUNT_PCT
  const pct = Number(raw)
  return pct <= MAX_DISCOUNT_PCT ? pct : DEFAULT_DISCOUNT_PCT
}

function requireToken(env) {
  const token = env.HOSTEX_ACCESS_TOKEN
  if (typeof token !== 'string' || token === '') throw new Unavailable('HOSTEX_ACCESS_TOKEN is not set')
  return token
}

function dateMs(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  const ms = Date.UTC(y, m - 1, d)
  return new Date(ms).toISOString().slice(0, 10) === value ? ms : null
}

function param(query, key) {
  const value = typeof query?.get === 'function' ? query.get(key) : query?.[key]
  return typeof value === 'string' ? value : null
}

// 429 reply when `ip` is over the limit; null otherwise. No ip (direct calls in tests) → not limited.
function rateLimited(rateLimiter, ip, now) {
  if (ip === undefined) return null
  const slot = rateLimiter.take(ip, now.getTime())
  if (slot.allowed) return null
  return reply(429, { error: 'rate_limited' }, { ...NO_STORE, 'Retry-After': String(slot.retryAfterSec) })
}

function hasQuery(query) {
  if (!query) return false
  if (typeof query.keys === 'function') return !query.keys().next().done
  return Object.keys(query).length > 0
}

function unavailable(error) {
  console.error('[api/booking] unavailable:', error?.message)
  return fail(503, 'unavailable')
}

export async function handleCalendar({
  query,
  env = {},
  now = new Date(),
  loadNightsImpl = loadNights,
  ip,
  rateLimiter = bookingRateLimiters.calendar,
} = {}) {
  const limited = rateLimited(rateLimiter, ip, now)
  if (limited) return limited
  // The calendar takes no parameters; refusing them keeps it cacheable by path and cheap to reject.
  if (hasQuery(query)) return fail(400, 'bad_request')
  try {
    const token = requireToken(env)
    const today = romeToday(now)
    const horizon = addDays(today, HORIZON_DAYS)
    const nightsByUnit = await loadNightsImpl({ unitIds: [...DIRECT_UNIT_IDS], from: today, to: horizon, token })

    const units = {}
    for (const id of DIRECT_UNIT_IDS) {
      const nights = nightsByUnit?.[id]
      if (!Array.isArray(nights)) throw new Error(`No nights returned for ${id}`)
      units[id] = {
        maxGuests: getDirectUnit(id).maxGuests,
        nights: nights.map((n) => {
          const bookable = n.bookable === true && Number.isInteger(n.priceCents) && n.priceCents > 0
          const night = {
            d: n.date,
            b: bookable ? 1 : 0,
            p: bookable ? n.priceCents : null,
            m: Math.max(MIN_STAY_NIGHTS, Number.isInteger(n.minStay) ? n.minStay : 0),
          }
          // Restrictions quoteStay refuses on: arrival on this day / departure on this day.
          if (n.closedOnArrival === true) night.a = 1
          if (n.closedOnDeparture === true) night.x = 1
          return night
        }),
      }
    }
    return reply(200, { today, horizon, discountPct: discountPct(env), units }, CALENDAR_CACHE)
  } catch (error) {
    return unavailable(error)
  }
}

export async function handleQuote({
  query,
  env = {},
  now = new Date(),
  loadNightsImpl = loadNights,
  ip,
  rateLimiter = bookingRateLimiters.quote,
} = {}) {
  const limited = rateLimited(rateLimiter, ip, now)
  if (limited) return limited
  const unitId = param(query, 'unit')
  const unit = getDirectUnit(unitId)
  if (!unit) return fail(404, 'not_found')

  const checkIn = param(query, 'from')
  const checkOut = param(query, 'to')
  const guestsRaw = param(query, 'guests')
  const inMs = dateMs(checkIn)
  const outMs = dateMs(checkOut)
  if (inMs === null || outMs === null || outMs <= inMs || (outMs - inMs) / DAY_MS > MAX_STAY_NIGHTS) {
    return fail(400, 'bad_request')
  }
  if (guestsRaw === null || !/^\d+$/.test(guestsRaw)) return fail(400, 'bad_request')
  const guests = Number(guestsRaw)
  if (!Number.isSafeInteger(guests) || guests < 1) return fail(400, 'bad_request')

  try {
    const token = requireToken(env)
    const today = romeToday(now)
    // Beyond the booking horizon: nothing is open there; do not ask Hostex.
    if (checkOut > addDays(today, HORIZON_DAYS)) {
      return reply(200, { unit: unitId, checkIn, checkOut, guests, ok: false, reason: 'unavailable' })
    }
    // A past check-in is refused by quoteStay; never ask Hostex about past dates.
    // checkOut is requested inclusively so quoteStay can see closedOnDeparture.
    const nights =
      checkIn < today
        ? []
        : (await loadNightsImpl({ unitIds: [unitId], from: checkIn, to: checkOut, token }))?.[unitId]
    if (!Array.isArray(nights)) throw new Error(`No nights returned for ${unitId}`)

    const pct = discountPct(env)
    const result = quoteStay({ nights, checkIn, checkOut, guests, maxGuests: unit.maxGuests, discountPct: pct, today })
    return reply(200, { unit: unitId, checkIn, checkOut, guests, ...result, ...(result.ok ? { discountPct: pct } : {}) })
  } catch (error) {
    return unavailable(error)
  }
}

// Shared wrapper for the Node route server (production and dev) and the api/ wrappers: GET/HEAD only, query from req.url.
export async function serveBooking(req, res, handle, { env = process.env, now, loadNightsImpl, rateLimiter } = {}) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    res.setHeader('Cache-Control', 'no-store')
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  const query = new URL(req.url || '/', 'http://localhost').searchParams
  const result = await handle({ query, env, now: now ?? new Date(), loadNightsImpl, ip: clientIp(req), rateLimiter })
  for (const [key, value] of Object.entries(result.headers)) res.setHeader(key, value)
  res.status(result.status).json(result.body)
}
