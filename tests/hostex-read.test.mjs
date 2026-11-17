import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadNights, HostexError } from '../scripts/lib/hostex-read.mjs'

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'))
const AVAILABILITIES = fixture('hostex-availabilities.json')
const CALENDAR = fixture('hostex-listing-calendar.json')

const TOKEN = 'fake-token-for-tests'
const RANGE = { from: '2026-12-19', to: '2026-12-23' }

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

// Fake Hostex: routes by path, records every call.
function fakeHostex({ availabilities = AVAILABILITIES, calendar = CALENDAR, status = 200 } = {}) {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init })
    const { pathname } = new URL(url)
    if (pathname === '/v3/availabilities') return json(availabilities, status)
    if (pathname === '/v3/listings/calendar') return json(calendar, status)
    return json({ error_code: 404 }, 404)
  }
  return { fetchImpl, calls }
}

const byDate = (nights) => Object.fromEntries(nights.map((n) => [n.date, n]))

test('(a) nights merge availability and calendar for both units', async () => {
  const { fetchImpl } = fakeHostex()
  const result = await loadNights({ unitIds: ['orange', 'vintage'], ...RANGE, token: TOKEN, fetchImpl })

  assert.deepEqual(Object.keys(result).sort(), ['orange', 'vintage'])
  for (const nights of Object.values(result)) {
    assert.deepEqual(nights.map((n) => n.date), ['2026-12-19', '2026-12-20', '2026-12-21', '2026-12-22', '2026-12-23'])
  }

  const orange = byDate(result.orange)
  const vintage = byDate(result.vintage)

  // Boundary 1: orange 12-19 is not available (and has no inventory) but still has a price.
  assert.deepEqual(orange['2026-12-19'], {
    date: '2026-12-19', bookable: false, priceCents: 10000, minStay: 2, closedOnArrival: false, closedOnDeparture: false,
  })
  // Boundary 2: vintage 12-23 has no price.
  assert.deepEqual(vintage['2026-12-23'], {
    date: '2026-12-23', bookable: false, priceCents: null, minStay: 2, closedOnArrival: false, closedOnDeparture: false,
  })
  // Boundary 3: vintage 12-21 available with a price but zero inventory.
  assert.equal(vintage['2026-12-21'].bookable, false)
  assert.equal(vintage['2026-12-21'].priceCents, 9000)

  // Ordinary bookable nights, restrictions and fractional prices.
  assert.deepEqual(orange['2026-12-20'], {
    date: '2026-12-20', bookable: true, priceCents: 10000, minStay: 2, closedOnArrival: true, closedOnDeparture: false,
  })
  assert.deepEqual(orange['2026-12-21'], {
    date: '2026-12-21', bookable: true, priceCents: 11050, minStay: 0, closedOnArrival: false, closedOnDeparture: false,
  })
  assert.equal(orange['2026-12-22'].closedOnDeparture, true)
  assert.equal(orange['2026-12-22'].minStay, 3)
  assert.equal(vintage['2026-12-22'].bookable, true)
  assert.equal(vintage['2026-12-22'].priceCents, 9500)
})

test('(b) requests use the right URLs, methods, body and token header', async () => {
  const { fetchImpl, calls } = fakeHostex()
  await loadNights({ unitIds: ['orange', 'vintage'], ...RANGE, token: TOKEN, fetchImpl })

  assert.equal(calls.length, 2)
  const avail = calls.find((c) => new URL(c.url).pathname === '/v3/availabilities')
  const cal = calls.find((c) => new URL(c.url).pathname === '/v3/listings/calendar')
  assert.ok(avail && cal)

  const availUrl = new URL(avail.url)
  assert.equal(availUrl.origin, 'https://api.hostex.io')
  assert.equal(availUrl.searchParams.get('property_ids'), '12843799,12843798')
  assert.equal(availUrl.searchParams.get('start_date'), '2026-12-19')
  assert.equal(availUrl.searchParams.get('end_date'), '2026-12-23')
  assert.equal(avail.init.method ?? 'GET', 'GET')
  assert.equal(avail.init.headers['Hostex-Access-Token'], TOKEN)

  assert.equal(cal.url, 'https://api.hostex.io/v3/listings/calendar')
  assert.equal(cal.init.method, 'POST')
  assert.equal(cal.init.headers['Hostex-Access-Token'], TOKEN)
  assert.equal(cal.init.headers['Content-Type'], 'application/json')
  assert.deepEqual(JSON.parse(cal.init.body), {
    start_date: '2026-12-19',
    end_date: '2026-12-23',
    listings: [
      { channel_type: 'airbnb', listing_id: '1622640206186838346' },
      { channel_type: 'airbnb', listing_id: '1491803199632820467' },
    ],
  })
})

test('(c) error_code 400 in the body → HostexError without the token', async () => {
  const { fetchImpl } = fakeHostex({ calendar: { error_code: 400, error_msg: 'Bad request' } })
  await assert.rejects(
    loadNights({ unitIds: ['orange'], ...RANGE, token: TOKEN, fetchImpl }),
    (err) => err instanceof HostexError && err.status === 400 && !err.message.includes(TOKEN),
  )
})

test('(d) HTTP 429 → HostexError with status 429', async () => {
  const { fetchImpl } = fakeHostex({ status: 429, availabilities: { error_code: 429 }, calendar: { error_code: 429 } })
  await assert.rejects(
    loadNights({ unitIds: ['orange'], ...RANGE, token: TOKEN, fetchImpl }),
    (err) => err instanceof HostexError && err.status === 429 && !err.message.includes(TOKEN),
  )
})

test('(e) a hanging fetch times out → HostexError', async () => {
  const signals = []
  const fetchImpl = (url, init) => {
    signals.push(init.signal)
    return new Promise((_, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true })
    })
  }
  const started = Date.now()
  await assert.rejects(
    loadNights({ unitIds: ['orange'], ...RANGE, token: TOKEN, fetchImpl, timeoutMs: 20 }),
    (err) => err instanceof HostexError && !err.message.includes(TOKEN),
  )
  assert.ok(Date.now() - started < 1000)
  assert.equal(signals.length, 2)
  assert.ok(signals.every((s) => s.aborted))
})

test('(f) a listing missing from the calendar response → all its nights unbookable', async () => {
  const calendar = structuredClone(CALENDAR)
  calendar.data.listings = calendar.data.listings.filter((l) => l.listing_id !== '1491803199632820467')
  const { fetchImpl } = fakeHostex({ calendar })
  const result = await loadNights({ unitIds: ['orange', 'vintage'], ...RANGE, token: TOKEN, fetchImpl })

  assert.equal(result.vintage.length, 5)
  for (const n of result.vintage) {
    assert.deepEqual(n, {
      date: n.date, bookable: false, priceCents: null, minStay: 0, closedOnArrival: false, closedOnDeparture: false,
    })
  }
  assert.equal(result.orange.filter((n) => n.bookable).length, 4)
})

test('a property missing from availabilities → its nights unbookable', async () => {
  const availabilities = structuredClone(AVAILABILITIES)
  availabilities.data.properties = availabilities.data.properties.filter((p) => p.id !== 12843798)
  const { fetchImpl } = fakeHostex({ availabilities })
  const result = await loadNights({ unitIds: ['vintage'], ...RANGE, token: TOKEN, fetchImpl })
  assert.ok(result.vintage.every((n) => n.bookable === false))
  assert.equal(result.vintage[0].priceCents, 9000)
})

test('a date omitted by Hostex is still returned as unbookable', async () => {
  const calendar = structuredClone(CALENDAR)
  const orangeListing = calendar.data.listings.find((l) => l.listing_id === '1622640206186838346')
  orangeListing.calendar = orangeListing.calendar.filter((d) => d.date !== '2026-12-21')
  const { fetchImpl } = fakeHostex({ calendar })
  const result = await loadNights({ unitIds: ['orange'], ...RANGE, token: TOKEN, fetchImpl })
  assert.deepEqual(result.orange.map((n) => n.date), ['2026-12-19', '2026-12-20', '2026-12-21', '2026-12-22', '2026-12-23'])
  assert.deepEqual(byDate(result.orange)['2026-12-21'], {
    date: '2026-12-21', bookable: false, priceCents: null, minStay: 0, closedOnArrival: false, closedOnDeparture: false,
  })
})

test('unknown unit id throws before any network call', async () => {
  const { fetchImpl, calls } = fakeHostex()
  await assert.rejects(
    loadNights({ unitIds: ['orange', 'nope'], ...RANGE, token: TOKEN, fetchImpl }),
    (err) => err instanceof Error && !(err instanceof HostexError) && /nope/.test(err.message),
  )
  assert.equal(calls.length, 0)
})

test('a rejecting fetch (network error) → HostexError without the token', async () => {
  const fetchImpl = async () => {
    throw new TypeError('fetch failed')
  }
  await assert.rejects(
    loadNights({ unitIds: ['orange'], ...RANGE, token: TOKEN, fetchImpl }),
    (err) => err instanceof HostexError && !err.message.includes(TOKEN),
  )
})

test('malformed, inverted or oversized ranges throw RangeError before any network call', async () => {
  const cases = [
    { from: '2026-12-19', to: 'zzzz' },
    { from: '2026-12-19', to: '2026-12-19T' },
    { from: '2026-12-19', to: '2026-02-30' },
    { from: 'nope', to: '2026-12-23' },
    { from: '2026-12-19', to: '9999-12-31' },
    { from: '2026-12-23', to: '2026-12-19' },
    { from: '2026-01-01', to: '2027-01-02' }, // 367 days inclusive
  ]
  for (const range of cases) {
    const { fetchImpl, calls } = fakeHostex()
    await assert.rejects(
      loadNights({ unitIds: ['orange'], ...range, token: TOKEN, fetchImpl }),
      RangeError,
      JSON.stringify(range),
    )
    assert.equal(calls.length, 0)
  }
})

test('a 366-day range inclusive of both ends is accepted', async () => {
  const { fetchImpl, calls } = fakeHostex()
  const result = await loadNights({ unitIds: ['orange'], from: '2026-01-01', to: '2027-01-01', token: TOKEN, fetchImpl })
  assert.equal(result.orange.length, 366)
  assert.equal(result.orange.at(-1).date, '2027-01-01')
  assert.equal(calls.length, 2)
})

test('missing or empty token throws a plain Error before any network call', async () => {
  for (const token of [undefined, '', '   ']) {
    const { fetchImpl, calls } = fakeHostex()
    await assert.rejects(
      loadNights({ unitIds: ['orange'], ...RANGE, token, fetchImpl }),
      (err) => err instanceof Error && !(err instanceof HostexError) && /token/i.test(err.message),
    )
    assert.equal(calls.length, 0)
  }
})

test('a fetch that never settles and ignores the abort signal still times out', async () => {
  const fetchImpl = () => new Promise(() => {})
  const started = Date.now()
  await assert.rejects(
    loadNights({ unitIds: ['orange'], ...RANGE, token: TOKEN, fetchImpl, timeoutMs: 20 }),
    (err) => err instanceof HostexError && err.status === 504 && !err.message.includes(TOKEN),
  )
  assert.ok(Date.now() - started < 1000)
})

test('duplicate unit ids are sent once and returned once', async () => {
  const { fetchImpl, calls } = fakeHostex()
  const result = await loadNights({ unitIds: ['orange', 'orange', 'vintage', 'orange'], ...RANGE, token: TOKEN, fetchImpl })
  assert.deepEqual(Object.keys(result), ['orange', 'vintage'])
  const avail = calls.find((c) => new URL(c.url).pathname === '/v3/availabilities')
  const cal = calls.find((c) => new URL(c.url).pathname === '/v3/listings/calendar')
  assert.equal(new URL(avail.url).searchParams.get('property_ids'), '12843799,12843798')
  assert.deepEqual(JSON.parse(cal.init.body).listings.map((l) => l.listing_id), ['1622640206186838346', '1491803199632820467'])
})

test('min_stay_on_arrival is parsed as a base-10 integer; junk or negative → 0', async () => {
  const cases = [['3', 3], [4, 4], ['5 nights', 5], [2.7, 2], ['abc', 0], [-1, 0], ['-2', 0], [null, 0], [undefined, 0], [true, 0]]
  for (const [value, expected] of cases) {
    const calendar = structuredClone(CALENDAR)
    const orangeListing = calendar.data.listings.find((l) => l.listing_id === '1622640206186838346')
    orangeListing.calendar.find((d) => d.date === '2026-12-20').restrictions.min_stay_on_arrival = value
    const { fetchImpl } = fakeHostex({ calendar })
    const result = await loadNights({ unitIds: ['orange'], ...RANGE, token: TOKEN, fetchImpl })
    assert.equal(byDate(result.orange)['2026-12-20'].minStay, expected, JSON.stringify(value))
  }
})
