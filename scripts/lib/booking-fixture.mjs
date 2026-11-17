// Dev-only stand-in for loadNights (BOOKING_FIXTURE=1 in scripts/contact-server.mjs).
// Deterministic, no network. Never imported by api/.

import { addDays } from './booking-quote.mjs'

const WINDOW_FROM = '2026-12-15'
const WINDOW_TO = '2027-01-08'
const PRICE_CENTS = { orange: 8300, vintage: 7800, youth: 7900, solo: 6500 }

export async function fixtureLoadNights({ unitIds, from, to }) {
  const result = {}
  for (const id of unitIds) {
    const nights = []
    for (let date = from; date <= to; date = addDays(date, 1)) {
      const price = Object.hasOwn(PRICE_CENTS, id) ? PRICE_CENTS[id] : null
      const bookable = price !== null && date >= WINDOW_FROM && date <= WINDOW_TO
      nights.push({
        date,
        bookable,
        priceCents: bookable ? price : null,
        minStay: 2,
        closedOnArrival: false,
        closedOnDeparture: false,
      })
    }
    result[id] = nights
  }
  return result
}
