import test from 'node:test'
import assert from 'node:assert/strict'
import { romeToday, addDays, quoteStay } from '../scripts/lib/booking-quote.mjs'

const night = (date, price, extra = {}) => ({
  date,
  bookable: true,
  priceCents: price,
  minStay: 1,
  closedOnArrival: false,
  closedOnDeparture: false,
  ...extra,
})

const range = (from, count, price, extra) =>
  Array.from({ length: count }, (_, i) => night(addDays(from, i), price, extra))

const base = {
  guests: 2,
  maxGuests: 2,
  discountPct: 10,
  today: '2026-11-17',
}

test('orange 20–22 Dec for 2 guests', () => {
  const q = quoteStay({ nights: [night('2026-12-20', 8300), night('2026-12-21', 8300), night('2026-12-22', 8300)],
    checkIn: '2026-12-20', checkOut: '2026-12-22', guests: 2, maxGuests: 2, discountPct: 10, today: '2026-11-17' })
  assert.deepEqual(
    [q.ok, q.nights, q.subtotalCents, q.discountCents, q.totalCents, q.cityTaxCents],
    [true, 2, 16600, 1660, 14940, 1000])
  assert.deepEqual([q.freeCancellationUntil, q.chargeDate, q.payNow, q.refundable],
    ['2026-12-13', '2026-12-11', false, true])
  assert.deepEqual(q.perNight, [
    { date: '2026-12-20', priceCents: 8300 },
    { date: '2026-12-21', priceCents: 8300 },
  ])
})

test('per-night prices differ and discount rounds to nearest cent', () => {
  const q = quoteStay({ ...base, nights: [night('2026-12-20', 8333), night('2026-12-21', 9000)],
    checkIn: '2026-12-20', checkOut: '2026-12-22', guests: 1 })
  assert.deepEqual(
    [q.ok, q.subtotalCents, q.discountCents, q.totalCents, q.cityTaxCents],
    [true, 17333, 1733, 15600, 500])
  const q2 = quoteStay({ ...base, nights: [night('2026-12-20', 8333), night('2026-12-21', 8333)],
    checkIn: '2026-12-20', checkOut: '2026-12-22' })
  // 16666 * 10% = 1666.6 → 1667
  assert.deepEqual([q2.subtotalCents, q2.discountCents, q2.totalCents], [16666, 1667, 14999])
})

test('zero discount', () => {
  const q = quoteStay({ ...base, discountPct: 0, nights: range('2026-12-20', 3, 8300),
    checkIn: '2026-12-20', checkOut: '2026-12-23' })
  assert.deepEqual([q.ok, q.nights, q.subtotalCents, q.discountCents, q.totalCents, q.cityTaxCents],
    [true, 3, 24900, 0, 24900, 1500])
})

test('invalid discountPct is a caller error', () => {
  for (const discountPct of [undefined, NaN, -1, 101, '10']) {
    assert.throws(() => quoteStay({ ...base, discountPct, nights: range('2026-12-20', 2, 8300),
      checkIn: '2026-12-20', checkOut: '2026-12-22' }), RangeError, `discountPct=${String(discountPct)}`)
  }
})

test('checkout on first closed day is allowed', () => {
  const q = quoteStay({ ...base,
    nights: [night('2027-01-07', 7000), night('2027-01-08', 7000), night('2027-01-09', null, { bookable: false })],
    checkIn: '2027-01-07', checkOut: '2027-01-09' })
  assert.equal(q.ok, true)
  assert.equal(q.nights, 2)
  assert.equal(q.subtotalCents, 14000)
})

test('checkout day missing from nights is allowed', () => {
  const q = quoteStay({ ...base, nights: [night('2027-01-07', 7000), night('2027-01-08', 7000)],
    checkIn: '2027-01-07', checkOut: '2027-01-09' })
  assert.equal(q.ok, true)
  assert.equal(q.nights, 2)
})

test('partially open range is refused', () => {
  const q = quoteStay({ ...base,
    nights: [night('2026-12-13', null, { bookable: false }), ...range('2026-12-14', 3, 8300)],
    checkIn: '2026-12-13', checkOut: '2026-12-16' })
  assert.deepEqual(q, { ok: false, reason: 'unavailable' })
  const q2 = quoteStay({ ...base,
    nights: [night('2026-12-12', 8300), night('2026-12-13', null, { bookable: false }), ...range('2026-12-14', 3, 8300)],
    checkIn: '2026-12-12', checkOut: '2026-12-16' })
  assert.deepEqual(q2, { ok: false, reason: 'unavailable' })
})

test('night missing inside the range is unavailable', () => {
  const q = quoteStay({ ...base, nights: [night('2026-12-20', 8300), night('2026-12-22', 8300)],
    checkIn: '2026-12-20', checkOut: '2026-12-23' })
  assert.deepEqual(q, { ok: false, reason: 'unavailable' })
})

test('bookable night without a price is unavailable', () => {
  const q = quoteStay({ ...base, nights: [night('2026-12-20', 8300), night('2026-12-21', null)],
    checkIn: '2026-12-20', checkOut: '2026-12-22' })
  assert.deepEqual(q, { ok: false, reason: 'unavailable' })
})

test('one night refused with min stay', () => {
  const q = quoteStay({ ...base, nights: range('2026-12-20', 2, 8300),
    checkIn: '2026-12-20', checkOut: '2026-12-21' })
  assert.deepEqual(q, { ok: false, reason: 'min_stay', minStay: 2 })
})

test('min stay from arrival night wins when higher', () => {
  const q = quoteStay({ ...base, nights: [night('2026-12-20', 8300, { minStay: 3 }), ...range('2026-12-21', 3, 8300)],
    checkIn: '2026-12-20', checkOut: '2026-12-22' })
  assert.deepEqual(q, { ok: false, reason: 'min_stay', minStay: 3 })
  const ok = quoteStay({ ...base, nights: [night('2026-12-20', 8300, { minStay: 3 }), ...range('2026-12-21', 3, 8300)],
    checkIn: '2026-12-20', checkOut: '2026-12-23' })
  assert.equal(ok.ok, true)
  assert.equal(ok.nights, 3)
})

test('min stay of later nights is ignored', () => {
  const q = quoteStay({ ...base, nights: [night('2026-12-20', 8300), night('2026-12-21', 8300, { minStay: 5 })],
    checkIn: '2026-12-20', checkOut: '2026-12-22' })
  assert.equal(q.ok, true)
})

test('closed on arrival', () => {
  const q = quoteStay({ ...base, nights: [night('2026-12-20', 8300, { closedOnArrival: true }), night('2026-12-21', 8300)],
    checkIn: '2026-12-20', checkOut: '2026-12-22' })
  assert.deepEqual(q, { ok: false, reason: 'closed_arrival' })
})

test('closed on departure', () => {
  const q = quoteStay({ ...base,
    nights: [...range('2026-12-20', 2, 8300), night('2026-12-22', 8300, { closedOnDeparture: true })],
    checkIn: '2026-12-20', checkOut: '2026-12-22' })
  assert.deepEqual(q, { ok: false, reason: 'closed_departure' })
})

test('closedOnDeparture on a night inside the stay does not matter', () => {
  const q = quoteStay({ ...base, nights: [night('2026-12-20', 8300, { closedOnDeparture: true }), night('2026-12-21', 8300)],
    checkIn: '2026-12-20', checkOut: '2026-12-22' })
  assert.equal(q.ok, true)
})

test('two guests in solo', () => {
  const q = quoteStay({ ...base, maxGuests: 1, nights: range('2026-12-20', 2, 6000),
    checkIn: '2026-12-20', checkOut: '2026-12-22', guests: 2 })
  assert.deepEqual(q, { ok: false, reason: 'too_many_guests' })
  const solo = quoteStay({ ...base, maxGuests: 1, nights: range('2026-12-20', 2, 6000),
    checkIn: '2026-12-20', checkOut: '2026-12-22', guests: 1 })
  assert.equal(solo.ok, true)
  assert.equal(solo.cityTaxCents, 500)
})

test('guests 0, 3, NaN', () => {
  for (const guests of [0, 3, NaN, -1, 1.5, '2', undefined]) {
    const q = quoteStay({ ...base, nights: range('2026-12-20', 2, 8300),
      checkIn: '2026-12-20', checkOut: '2026-12-22', guests })
    assert.deepEqual(q, { ok: false, reason: 'too_many_guests' }, `guests=${String(guests)}`)
  }
})

test('from after to, malformed date', () => {
  const nights = range('2026-12-20', 5, 8300)
  for (const [checkIn, checkOut] of [
    ['2026-12-22', '2026-12-20'],
    ['2026-12-20', '2026-12-20'],
    ['2026-13-40', '2026-12-22'],
    ['2026-02-30', '2026-03-02'],
    ['2026-12-20', '2026-12-32'],
    ['2026-12-2', '2026-12-22'],
    ['20-12-2026', '22-12-2026'],
    ['2026-12-20T00:00', '2026-12-22'],
    ['', '2026-12-22'],
    [undefined, '2026-12-22'],
    [20261220, '2026-12-22'],
  ]) {
    assert.deepEqual(quoteStay({ ...base, nights, checkIn, checkOut }),
      { ok: false, reason: 'invalid_dates' }, `${checkIn} → ${checkOut}`)
  }
})

test('check-in before today', () => {
  const q = quoteStay({ ...base, nights: range('2026-11-16', 3, 8300),
    checkIn: '2026-11-16', checkOut: '2026-11-18' })
  assert.deepEqual(q, { ok: false, reason: 'past' })
})

test('check-in today is allowed', () => {
  const q = quoteStay({ ...base, nights: range('2026-11-17', 2, 8300),
    checkIn: '2026-11-17', checkOut: '2026-11-19' })
  assert.equal(q.ok, true)
  assert.deepEqual([q.payNow, q.refundable], [true, false])
})

test('check order: invalid_dates, then past, then too_many_guests, then min_stay', () => {
  const nights = [night('2026-11-10', 8300, { closedOnArrival: true })]
  // invalid dates beat everything
  assert.equal(quoteStay({ ...base, nights, checkIn: '2026-02-30', checkOut: '2026-11-11', guests: 9 }).reason, 'invalid_dates')
  // past beats too_many_guests and min_stay
  assert.equal(quoteStay({ ...base, nights, checkIn: '2026-11-10', checkOut: '2026-11-11', guests: 9 }).reason, 'past')
  // too_many_guests beats min_stay, closed_arrival, unavailable
  const future = [night('2026-12-20', 8300, { closedOnArrival: true, minStay: 4 })]
  assert.equal(quoteStay({ ...base, nights: future, checkIn: '2026-12-20', checkOut: '2026-12-21', guests: 9 }).reason, 'too_many_guests')
  // min_stay beats closed_arrival and unavailable
  assert.deepEqual(quoteStay({ ...base, nights: future, checkIn: '2026-12-20', checkOut: '2026-12-21' }),
    { ok: false, reason: 'min_stay', minStay: 4 })
  // closed_arrival beats unavailable and closed_departure
  const closed = [night('2026-12-20', 8300, { closedOnArrival: true }), night('2026-12-22', 8300, { closedOnDeparture: true })]
  assert.equal(quoteStay({ ...base, nights: closed, checkIn: '2026-12-20', checkOut: '2026-12-22' }).reason, 'closed_arrival')
  // unavailable beats closed_departure
  const gap = [night('2026-12-20', 8300), night('2026-12-22', 8300, { closedOnDeparture: true })]
  assert.equal(quoteStay({ ...base, nights: gap, checkIn: '2026-12-20', checkOut: '2026-12-22' }).reason, 'unavailable')
})

test('booking 8 days out: charged now, still refundable', () => {
  const q = quoteStay({ ...base, nights: range('2026-11-25', 2, 8300),
    checkIn: '2026-11-25', checkOut: '2026-11-27' })
  assert.deepEqual([q.ok, q.freeCancellationUntil, q.chargeDate, q.payNow, q.refundable],
    [true, '2026-11-18', '2026-11-16', true, true])
})

test('booking 3 days out: charged now, not refundable', () => {
  const q = quoteStay({ ...base, nights: range('2026-11-20', 2, 8300),
    checkIn: '2026-11-20', checkOut: '2026-11-22' })
  assert.deepEqual([q.ok, q.freeCancellationUntil, q.chargeDate, q.payNow, q.refundable],
    [true, '2026-11-13', '2026-11-11', true, false])
})

test('payment and refund boundaries', () => {
  const at = (checkIn) => quoteStay({ ...base, nights: range(checkIn, 2, 8300), checkIn, checkOut: addDays(checkIn, 2) })
  // 10 days out: charge date tomorrow
  assert.deepEqual([at('2026-11-27').payNow, at('2026-11-27').refundable], [false, true])
  // 9 days out: charge date is today
  assert.deepEqual([at('2026-11-26').chargeDate, at('2026-11-26').payNow], ['2026-11-17', true])
  // 7 days out: last free-cancellation day is today
  assert.deepEqual([at('2026-11-24').freeCancellationUntil, at('2026-11-24').refundable], ['2026-11-17', true])
  // 6 days out: free cancellation ended yesterday
  assert.equal(at('2026-11-23').refundable, false)
})

test('addDays crosses month, year and leap day', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
  assert.equal(addDays('2027-01-01', -9), '2026-12-23')
  assert.equal(addDays('2028-02-28', 1), '2028-02-29')
  assert.equal(addDays('2027-02-28', 1), '2027-03-01')
  assert.equal(addDays('2026-03-29', 0), '2026-03-29')
})

test('romeToday near midnight', () => {
  assert.equal(romeToday(new Date('2026-12-31T23:30:00Z')), '2027-01-01')
})

test('romeToday in summer time', () => {
  assert.equal(romeToday(new Date('2026-07-14T21:59:00Z')), '2026-07-14')
  assert.equal(romeToday(new Date('2026-07-14T22:00:00Z')), '2026-07-15')
})
