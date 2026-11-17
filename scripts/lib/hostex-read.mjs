// Read-only Hostex client: availability and nightly prices for direct-booking units.
// Plain ESM, no dependencies. The access token is sent only as a header and never
// appears in error messages; nothing here logs.

import { getDirectUnit } from '../../src/data/direct-units.mjs'
import { addDays } from './booking-quote.mjs'

const API_BASE = 'https://api.hostex.io/v3'

export class HostexError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'HostexError'
    this.status = status
  }
}

function datesBetween(from, to) {
  const dates = []
  for (let d = from; d <= to; d = addDays(d, 1)) dates.push(d)
  return dates
}

// One Hostex request. Any failure becomes a HostexError carrying only the endpoint
// name and a status: never the URL query, headers or response body.
async function request(fetchImpl, endpoint, url, init, signal) {
  let res
  try {
    res = await fetchImpl(url, { ...init, signal })
  } catch {
    if (signal.aborted) throw new HostexError(`Hostex ${endpoint}: timed out`, 504)
    throw new HostexError(`Hostex ${endpoint}: network error`, 502)
  }
  if (!res.ok) throw new HostexError(`Hostex ${endpoint}: HTTP ${res.status}`, res.status)
  let body
  try {
    body = await res.json()
  } catch {
    if (signal.aborted) throw new HostexError(`Hostex ${endpoint}: timed out`, 504)
    throw new HostexError(`Hostex ${endpoint}: invalid JSON`, 502)
  }
  if (body?.error_code !== 200) {
    const code = Number.isInteger(body?.error_code) ? body.error_code : 502
    throw new HostexError(`Hostex ${endpoint}: error_code ${body?.error_code}`, code)
  }
  return body.data ?? {}
}

const CLOSED_NIGHT = { bookable: false, priceCents: null, minStay: 0, closedOnArrival: false, closedOnDeparture: false }

export async function loadNights({ unitIds, from, to, token, fetchImpl = fetch, timeoutMs = 8000 }) {
  const units = unitIds.map((id) => {
    const unit = getDirectUnit(id)
    if (!unit) throw new Error(`Unknown direct unit: ${id}`)
    return { id, ...unit }
  })
  const dates = datesBetween(from, to)
  if (dates.length === 0) throw new RangeError(`Empty date range: ${from}..${to}`)

  const headers = { 'Hostex-Access-Token': token }
  const availabilitiesUrl = new URL(`${API_BASE}/availabilities`)
  availabilitiesUrl.searchParams.set('property_ids', units.map((u) => u.hostexPropertyId).join(','))
  availabilitiesUrl.searchParams.set('start_date', from)
  availabilitiesUrl.searchParams.set('end_date', to)
  const calendarBody = {
    start_date: from,
    end_date: to,
    listings: units.map((u) => ({ channel_type: 'airbnb', listing_id: u.airbnbListingId })),
  }

  const controller = new AbortController()
  const { signal } = controller
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new HostexError('Hostex: timed out', 504))
    }, timeoutMs)
  })

  let availabilityData, calendarData
  try {
    ;[availabilityData, calendarData] = await Promise.race([
      Promise.all([
        request(fetchImpl, 'availabilities', availabilitiesUrl.href, { method: 'GET', headers }, signal),
        request(fetchImpl, 'listings/calendar', `${API_BASE}/listings/calendar`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(calendarBody),
        }, signal),
      ]),
      timeout,
    ])
  } finally {
    clearTimeout(timer)
    // Stops the sibling request when one fails; a no-op once both have finished.
    controller.abort()
  }

  const availableByProperty = new Map()
  for (const property of availabilityData.properties ?? []) {
    const byDate = new Map((property.availabilities ?? []).map((a) => [a.date, a.available === true]))
    availableByProperty.set(String(property.id), byDate)
  }
  const calendarByListing = new Map()
  for (const listing of calendarData.listings ?? []) {
    const byDate = new Map((listing.calendar ?? []).map((c) => [c.date, c]))
    calendarByListing.set(String(listing.listing_id), byDate)
  }

  const result = {}
  for (const unit of units) {
    const available = availableByProperty.get(String(unit.hostexPropertyId))
    const calendar = calendarByListing.get(unit.airbnbListingId)
    result[unit.id] = dates.map((date) => {
      const day = calendar?.get(date)
      if (!day) return { date, ...CLOSED_NIGHT }
      const price = typeof day.price === 'number' && Number.isFinite(day.price) ? day.price : null
      const restrictions = day.restrictions ?? {}
      return {
        date,
        bookable: available?.get(date) === true && price != null && day.inventory > 0,
        priceCents: price == null ? null : Math.round(price * 100),
        minStay: restrictions.min_stay_on_arrival || 0,
        closedOnArrival: restrictions.closed_on_arrival === true,
        closedOnDeparture: restrictions.closed_on_departure === true,
      }
    })
  }
  return result
}
