import http from 'node:http'
import contactHandler from '../api/contact.js'
import subscribeHandler from '../api/subscribe.js'
import availabilityHandler from '../api/availability.js'
import { handleCalendar, handleQuote, serveBooking } from './lib/booking-handlers.mjs'
import { fixtureLoadNights } from './lib/booking-fixture.mjs'
import { loadNights } from './lib/hostex-read.mjs'
import { createNightsCache } from './lib/nights-cache.mjs'

const port = Number(process.env.CONTACT_API_PORT || process.env.PORT || 8787)

// BOOKING_FIXTURE=1: synthetic nights, no Hostex call and no token needed (dev only).
const bookingFixture = process.env.BOOKING_FIXTURE === '1'
const bookingOptions = bookingFixture
  ? { env: { ...process.env, HOSTEX_ACCESS_TOKEN: 'fixture' }, loadNightsImpl: fixtureLoadNights }
  : {}
if (bookingFixture) console.log('[contact-api] booking routes use fixture nights')

// This process is the production server (no CDN in front), so the year-long
// calendar read is cached here for a minute. Quotes always read Hostex live.
const calendarOptions = {
  ...bookingOptions,
  loadNightsImpl: createNightsCache({ load: bookingOptions.loadNightsImpl ?? loadNights }),
}

const routes = {
  '/api/contact': contactHandler,
  '/api/subscribe': subscribeHandler,
  '/api/availability': availabilityHandler,
  '/api/booking/calendar': (req, res) => serveBooking(req, res, handleCalendar, calendarOptions),
  '/api/booking/quote': (req, res) => serveBooking(req, res, handleQuote, bookingOptions),
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const handler = routes[url.pathname]

  if (!handler) {
    res.statusCode = 404
    res.end('Not Found')
    return
  }

  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })

  req.on('end', () => {
    req.body = body
    res.status = (code) => {
      res.statusCode = code
      return res
    }
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    }
    handler(req, res)
  })
})

server.listen(port, () => {
  console.log(`[contact-api] listening on http://localhost:${port}/api/contact`)
})
