import test from 'node:test'
import assert from 'node:assert/strict'
import { handleCalendar, handleQuote, serveBooking, bookingRateLimiters } from '../scripts/lib/booking-handlers.mjs'
import { createRateLimiter } from '../scripts/lib/rate-limit.mjs'
import { unitState } from '../src/scripts/direct-booking-client.mjs'
import { HostexError } from '../scripts/lib/hostex-read.mjs'
import { addDays, quoteStay } from '../scripts/lib/booking-quote.mjs'

const NOW = new Date('2026-11-17T10:00:00Z') // Rome: 2026-11-17
const ENV = { HOSTEX_ACCESS_TOKEN: 'fake-token-for-tests' }
const PRICES = { orange: 8300, vintage: 7800, youth: 7900, solo: 6500 }

// Fake loadNights: every unit bookable 2026-12-15..2027-01-08 at its price, minStay 1;
// awesome never bookable. Records every call.
function fakeLoad({ closedOnDeparture = [] } = {}) {
  const calls = []
  const impl = async ({ unitIds, from, to, token }) => {
    calls.push({ unitIds, from, to, token })
    const out = {}
    for (const id of unitIds) {
      const nights = []
      for (let d = from; d <= to; d = addDays(d, 1)) {
        const open = PRICES[id] && d >= '2026-12-15' && d <= '2027-01-08'
        nights.push({
          date: d,
          bookable: Boolean(open),
          priceCents: open ? PRICES[id] : null,
          minStay: 1,
          closedOnArrival: false,
          closedOnDeparture: closedOnDeparture.includes(d),
        })
      }
      out[id] = nights
    }
    return out
  }
  return { impl, calls }
}

const quote = (params, opts = {}) => {
  const { impl, calls } = opts.load ?? fakeLoad()
  return handleQuote({
    query: new URLSearchParams(params),
    env: opts.env ?? ENV,
    now: opts.now ?? NOW,
    loadNightsImpl: impl,
  }).then((r) => ({ ...r, calls }))
}

const ORANGE = { unit: 'orange', from: '2026-12-20', to: '2026-12-22', guests: '2' }

test('calendar: five units in order, discount 10, pre-discount price', async () => {
  const { impl, calls } = fakeLoad()
  const r = await handleCalendar({ env: ENV, now: NOW, loadNightsImpl: impl })
  assert.equal(r.status, 200)
  assert.equal(r.headers['Cache-Control'], 'public, s-maxage=60, stale-while-revalidate=300')
  assert.equal(r.body.today, '2026-11-17')
  assert.equal(r.body.horizon, '2027-11-17')
  assert.equal(r.body.discountPct, 10)
  assert.deepEqual(Object.keys(r.body.units), ['orange', 'vintage', 'youth', 'solo', 'awesome'])
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0], {
    unitIds: ['orange', 'vintage', 'youth', 'solo', 'awesome'],
    from: '2026-11-17',
    to: '2027-11-17',
    token: ENV.HOSTEX_ACCESS_TOKEN,
  })

  const orange = r.body.units.orange
  assert.equal(orange.maxGuests, 2)
  assert.equal(orange.nights.length, 366)
  assert.equal(orange.nights[0].d, '2026-11-17')
  assert.equal(orange.nights.at(-1).d, '2027-11-17')
  const dec20 = orange.nights.find((n) => n.d === '2026-12-20')
  assert.deepEqual(dec20, { d: '2026-12-20', b: 1, p: 8300, m: 2 })
  assert.deepEqual(orange.nights[0], { d: '2026-11-17', b: 0, p: null, m: 2 })
  assert.equal(r.body.units.solo.maxGuests, 1)
  assert.ok(r.body.units.awesome.nights.every((n) => n.b === 0 && n.p === null))
  assert.equal(r.body.units.central, undefined)
})

test('calendar: bookable night with zero price is not offered; m >= minStay', async () => {
  const impl = async ({ unitIds, from }) =>
    Object.fromEntries(unitIds.map((id) => [id, [
      { date: from, bookable: true, priceCents: 0, minStay: 5, closedOnArrival: false, closedOnDeparture: false },
    ]]))
  const r = await handleCalendar({ env: ENV, now: NOW, loadNightsImpl: impl })
  assert.deepEqual(r.body.units.orange.nights[0], { d: '2026-11-17', b: 0, p: null, m: 5 })
})

test('DIRECT_DISCOUNT_PCT: invalid values fall back to 10', async () => {
  for (const value of [undefined, '', 'abc', '12.5', '-1', '51', '1e1', ' 20']) {
    const r = await handleCalendar({
      env: { ...ENV, DIRECT_DISCOUNT_PCT: value },
      now: NOW,
      loadNightsImpl: fakeLoad().impl,
    })
    assert.equal(r.body.discountPct, 10, `value ${JSON.stringify(value)}`)
  }
  for (const [value, pct] of [['0', 0], ['15', 15], ['50', 50]]) {
    const r = await handleCalendar({
      env: { ...ENV, DIRECT_DISCOUNT_PCT: value },
      now: NOW,
      loadNightsImpl: fakeLoad().impl,
    })
    assert.equal(r.body.discountPct, pct)
  }
})

test('quote: orange 20-22 December totals 14940 cents', async () => {
  const r = await quote(ORANGE)
  assert.equal(r.status, 200)
  assert.equal(r.headers['Cache-Control'], 'no-store')
  assert.equal(r.body.unit, 'orange')
  assert.equal(r.body.checkIn, '2026-12-20')
  assert.equal(r.body.checkOut, '2026-12-22')
  assert.equal(r.body.guests, 2)
  assert.equal(r.body.ok, true)
  assert.equal(r.body.subtotalCents, 16600)
  assert.equal(r.body.totalCents, 14940)
})

test('quote: discount comes from env, never from the query', async () => {
  const r = await quote({ ...ORANGE, discountPct: '50' }, { env: { ...ENV, DIRECT_DISCOUNT_PCT: '20' } })
  assert.equal(r.body.discountCents, 3320)
  assert.equal(r.body.totalCents, 13280)
})

test('quote: asks Hostex up to checkOut inclusive and honours closedOnDeparture', async () => {
  const load = fakeLoad({ closedOnDeparture: ['2026-12-22'] })
  const r = await quote(ORANGE, { load })
  assert.equal(load.calls.length, 1)
  assert.deepEqual(load.calls[0], {
    unitIds: ['orange'],
    from: '2026-12-20',
    to: '2026-12-22',
    token: ENV.HOSTEX_ACCESS_TOKEN,
  })
  assert.equal(r.status, 200)
  assert.equal(r.body.ok, false)
  assert.equal(r.body.reason, 'closed_departure')
})

test('quote: unknown unit is 404 without calling Hostex', async () => {
  for (const unit of ['central', '__proto__', '', 'constructor', 'ORANGE']) {
    const r = await quote({ ...ORANGE, unit })
    assert.equal(r.status, 404, `unit ${unit}`)
    assert.deepEqual(r.body, { error: 'not_found' })
    assert.equal(r.calls.length, 0)
  }
  const missing = await quote({ from: ORANGE.from, to: ORANGE.to, guests: '2' })
  assert.equal(missing.status, 404)
  assert.equal(missing.calls.length, 0)
})

test('quote: bad parameters are 400 without calling Hostex', async () => {
  const cases = [
    { guests: 'abc' },
    { guests: '0' },
    { guests: '-1' },
    { guests: '1.5' },
    { guests: '' },
    { from: '2026-13-40' },
    { from: '2026-02-30', to: '2026-03-02' },
    { from: '2026-12-20T00:00' },
    { to: '2026-12-19' },
    { to: '2026-12-20' },
    { from: '2026-12-01', to: '2027-01-01' }, // 31 nights
  ]
  for (const patch of cases) {
    const r = await quote({ ...ORANGE, ...patch })
    assert.equal(r.status, 400, JSON.stringify(patch))
    assert.deepEqual(r.body, { error: 'bad_request' })
    assert.equal(r.headers['Cache-Control'], 'no-store')
    assert.equal(r.calls.length, 0)
  }
  const thirty = await quote({ ...ORANGE, from: '2026-12-01', to: '2026-12-31' })
  assert.equal(thirty.status, 200)
})

test('quote: too many guests is a 200 refusal from quoteStay', async () => {
  const r = await quote({ ...ORANGE, guests: '3' })
  assert.equal(r.status, 200)
  assert.equal(r.body.ok, false)
  assert.equal(r.body.reason, 'too_many_guests')
})

test('quote: past check-in is refused without asking Hostex about the past', async () => {
  const r = await quote({ ...ORANGE, from: '2026-11-10', to: '2026-11-12' })
  assert.equal(r.status, 200)
  assert.equal(r.body.ok, false)
  assert.equal(r.body.reason, 'past')
  assert.equal(r.calls.length, 0)
})

test('HostexError is 503 no-store and logs only the message', async (t) => {
  const logged = t.mock.method(console, 'error', () => {})
  const impl = async () => {
    throw new HostexError('Hostex availabilities: HTTP 500', 500)
  }
  for (const run of [
    () => handleCalendar({ env: ENV, now: NOW, loadNightsImpl: impl }),
    () => handleQuote({ query: new URLSearchParams(ORANGE), env: ENV, now: NOW, loadNightsImpl: impl }),
  ]) {
    const r = await run()
    assert.equal(r.status, 503)
    assert.deepEqual(r.body, { error: 'unavailable' })
    assert.equal(r.headers['Cache-Control'], 'no-store')
  }
  assert.equal(logged.mock.callCount(), 2)
  for (const call of logged.mock.calls) {
    assert.equal(call.arguments.length, 2)
    assert.match(call.arguments[0], /^\[api\/booking\]/)
    assert.equal(call.arguments[1], 'Hostex availabilities: HTTP 500')
    assert.ok(!JSON.stringify(call.arguments).includes(ENV.HOSTEX_ACCESS_TOKEN))
  }
})

test('missing token is 503 without calling Hostex', async (t) => {
  t.mock.method(console, 'error', () => {})
  for (const env of [{}, { HOSTEX_ACCESS_TOKEN: '' }]) {
    const { impl, calls } = fakeLoad()
    const cal = await handleCalendar({ env, now: NOW, loadNightsImpl: impl })
    assert.equal(cal.status, 503)
    assert.deepEqual(cal.body, { error: 'unavailable' })
    assert.equal(cal.headers['Cache-Control'], 'no-store')
    const q = await handleQuote({ query: new URLSearchParams(ORANGE), env, now: NOW, loadNightsImpl: impl })
    assert.equal(q.status, 503)
    assert.equal(calls.length, 0)
  }
})

function fakeRes() {
  const res = { statusCode: 200, headers: {}, body: undefined }
  res.setHeader = (k, v) => {
    res.headers[k] = v
  }
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (data) => {
    res.body = data
  }
  return res
}

test('serveBooking: GET reads the query from req.url and writes the result', async () => {
  const res = fakeRes()
  await serveBooking(
    { method: 'GET', url: '/api/booking/quote?unit=orange&from=2026-12-20&to=2026-12-22&guests=2' },
    res,
    handleQuote,
    { env: ENV, now: NOW, loadNightsImpl: fakeLoad().impl },
  )
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['Cache-Control'], 'no-store')
  assert.equal(res.body.totalCents, 14940)
})

test('serveBooking: methods other than GET/HEAD are 405', async () => {
  const { impl, calls } = fakeLoad()
  const res = fakeRes()
  await serveBooking({ method: 'POST', url: '/api/booking/calendar' }, res, handleCalendar, {
    env: ENV,
    now: NOW,
    loadNightsImpl: impl,
  })
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers.Allow, 'GET, HEAD')
  assert.deepEqual(res.body, { error: 'method_not_allowed' })
  assert.equal(calls.length, 0)
})

// ---- final fix wave: restrictions, query guard, rate limit, horizon, discountPct ----

test('calendar: emits a/x only for closed-on-arrival / closed-on-departure nights', async () => {
  const impl = async ({ unitIds, from }) =>
    Object.fromEntries(unitIds.map((id) => [id, [
      { date: from, bookable: true, priceCents: 8000, minStay: 2, closedOnArrival: true, closedOnDeparture: false },
      { date: addDays(from, 1), bookable: true, priceCents: 8000, minStay: 2, closedOnArrival: false, closedOnDeparture: true },
      { date: addDays(from, 2), bookable: true, priceCents: 8000, minStay: 2, closedOnArrival: false, closedOnDeparture: false },
    ]]))
  const r = await handleCalendar({ env: ENV, now: NOW, loadNightsImpl: impl })
  assert.deepEqual(r.body.units.orange.nights, [
    { d: '2026-11-17', b: 1, p: 8000, m: 2, a: 1 },
    { d: '2026-11-18', b: 1, p: 8000, m: 2, x: 1 },
    { d: '2026-11-19', b: 1, p: 8000, m: 2 },
  ])
})

test('calendar: any query parameter is 400 no-store without calling Hostex', async () => {
  for (const qs of ['x=1', 'from=2026-12-20', 'a', '_=123']) {
    const { impl, calls } = fakeLoad()
    const r = await handleCalendar({ query: new URLSearchParams(qs), env: ENV, now: NOW, loadNightsImpl: impl })
    assert.equal(r.status, 400, qs)
    assert.deepEqual(r.body, { error: 'bad_request' })
    assert.equal(r.headers['Cache-Control'], 'no-store')
    assert.equal(calls.length, 0)
  }
  const ok = await handleCalendar({ query: new URLSearchParams(''), env: ENV, now: NOW, loadNightsImpl: fakeLoad().impl })
  assert.equal(ok.status, 200)
})

test('quote: check-out beyond today + 365 is a 200 unavailable refusal without calling Hostex', async () => {
  const r = await quote({ ...ORANGE, from: '2027-11-17', to: '2027-11-19' })
  assert.equal(r.status, 200)
  assert.equal(r.body.ok, false)
  assert.equal(r.body.reason, 'unavailable')
  assert.equal(r.body.unit, 'orange')
  assert.equal(r.calls.length, 0)
  const edge = await quote({ ...ORANGE, from: '2027-11-15', to: '2027-11-17' })
  assert.equal(edge.calls.length, 1)
})

test('quote: ok response carries the discountPct used', async () => {
  assert.equal((await quote(ORANGE)).body.discountPct, 10)
  assert.equal((await quote(ORANGE, { env: { ...ENV, DIRECT_DISCOUNT_PCT: '15' } })).body.discountPct, 15)
})

test('rate limit: quote allows 30 per minute per IP, then 429 with Retry-After and no Hostex call', async () => {
  const limiter = createRateLimiter({ limit: 30, windowMs: 60_000 })
  const { impl, calls } = fakeLoad()
  const run = (ip, now = NOW) =>
    handleQuote({ query: new URLSearchParams(ORANGE), env: ENV, now, loadNightsImpl: impl, ip, rateLimiter: limiter })
  for (let i = 0; i < 30; i++) assert.equal((await run('203.0.113.1')).status, 200)
  const over = await run('203.0.113.1')
  assert.equal(over.status, 429)
  assert.deepEqual(over.body, { error: 'rate_limited' })
  assert.equal(over.headers['Cache-Control'], 'no-store')
  assert.match(over.headers['Retry-After'], /^\d+$/)
  assert.ok(Number(over.headers['Retry-After']) >= 1 && Number(over.headers['Retry-After']) <= 60)
  assert.equal(calls.length, 30)
  assert.equal((await run('203.0.113.2')).status, 200, 'other IPs are not affected')
  assert.equal((await run('203.0.113.1', new Date(NOW.getTime() + 60_001))).status, 200, 'window expires')
  limiter.reset()
  assert.equal(limiter.size, 0)
})

test('rate limit: calendar allows 20 per minute per IP', async () => {
  const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 })
  const { impl, calls } = fakeLoad()
  const run = () => handleCalendar({ env: ENV, now: NOW, loadNightsImpl: impl, ip: '198.51.100.7', rateLimiter: limiter })
  for (let i = 0; i < 20; i++) assert.equal((await run()).status, 200)
  const over = await run()
  assert.equal(over.status, 429)
  assert.deepEqual(over.body, { error: 'rate_limited' })
  assert.equal(over.headers['Cache-Control'], 'no-store')
  assert.ok(Number(over.headers['Retry-After']) >= 1)
  assert.equal(calls.length, 20)
})

test('rate limit: default limits are 30 for quote and 20 for calendar', () => {
  assert.equal(bookingRateLimiters.quote.limit, 30)
  assert.equal(bookingRateLimiters.calendar.limit, 20)
  assert.equal(bookingRateLimiters.quote.windowMs, 60_000)
  assert.equal(bookingRateLimiters.calendar.windowMs, 60_000)
})

test('rate limiter prunes expired entries and stays bounded', () => {
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, maxKeys: 5 })
  for (let i = 0; i < 5; i++) limiter.take(`ip${i}`, 0)
  assert.equal(limiter.size, 5)
  limiter.take('late', 1500) // every earlier entry is expired → pruned
  assert.equal(limiter.size, 1)
  for (let i = 0; i < 20; i++) limiter.take(`burst${i}`, 1600)
  assert.ok(limiter.size <= 5)
})

test('serveBooking: passes the client IP to the limiter (x-forwarded-for first entry)', async () => {
  bookingRateLimiters.quote.reset()
  const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 })
  const send = async (headers) => {
    const res = fakeRes()
    await serveBooking(
      { method: 'GET', url: '/api/booking/quote?unit=orange&from=2026-12-20&to=2026-12-22&guests=2', headers },
      res,
      handleQuote,
      { env: ENV, now: NOW, loadNightsImpl: fakeLoad().impl, rateLimiter: limiter },
    )
    return res
  }
  assert.equal((await send({ 'x-forwarded-for': '192.0.2.5, 10.0.0.1' })).statusCode, 200)
  const over = await send({ 'x-forwarded-for': '192.0.2.5' })
  assert.equal(over.statusCode, 429)
  assert.ok(over.headers['Retry-After'])
  assert.equal((await send({ 'x-real-ip': '192.0.2.6' })).statusCode, 200)
})

test('seam: unitState (calendar payload) and quoteStay agree on bookable vs not', async () => {
  // Raw loadNights-shaped nights for orange, 2026-12-01..2026-12-12.
  const raw = []
  for (let d = '2026-12-01'; d <= '2026-12-12'; d = addDays(d, 1)) {
    raw.push({
      date: d,
      bookable: d !== '2026-12-09',
      priceCents: 9000,
      minStay: 2,
      closedOnArrival: d === '2026-12-05',
      closedOnDeparture: d === '2026-12-07',
    })
  }
  const impl = async ({ unitIds }) => Object.fromEntries(unitIds.map((id) => [id, raw]))
  const cal = await handleCalendar({ env: ENV, now: NOW, loadNightsImpl: impl })
  const unit = cal.body.units.orange
  const stays = [
    ['2026-12-01', '2026-12-03'], // open
    ['2026-12-05', '2026-12-07'], // closed arrival (and departure)
    ['2026-12-04', '2026-12-07'], // closed departure
    ['2026-12-05', '2026-12-08'], // closed arrival only
    ['2026-12-02', '2026-12-04'], // open
    ['2026-12-07', '2026-12-10'], // partially closed (12-09 not bookable)
    ['2026-12-07', '2026-12-09'], // check-out on the first closed day
    ['2026-12-06', '2026-12-08'], // open, passes over a closed-departure day
  ]
  for (const [from, to] of stays) {
    const q = quoteStay({ nights: raw, checkIn: from, checkOut: to, guests: 2, maxGuests: 2, discountPct: 10, today: '2026-11-17' })
    const s = unitState(unit, { from, to, guests: 2, discountPct: 10 })
    assert.equal(s.state === 'available', q.ok, `${from}..${to}: unitState ${s.state}, quote ${q.reason ?? 'ok'}`)
    if (q.ok) assert.equal(s.totalCents, q.totalCents)
  }
})
