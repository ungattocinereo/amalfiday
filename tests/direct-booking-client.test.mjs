import test from 'node:test'
import assert from 'node:assert/strict'
import {
  openWindows,
  unitState,
  selectableDates,
  bookUrl,
  sortByState,
  parseQuery,
  formatEuro,
  formatEuroTotal,
  formatRange,
  nightsBetween,
  addDaysIso,
  cityTaxCents,
  formatDateLong,
  formatStayRange,
  stayLine,
  priceLines,
  policyText,
  quoteMessage,
  requestUrl,
  quoteSummary,
  clampGuests,
  stayTooLong,
  minStayOnly,
} from '../src/scripts/direct-booking-client.mjs'

const open = (d, p, m = 2) => ({ d, b: 1, p, m })
const closed = (d) => ({ d, b: 0, p: null, m: 2 })

const orange = {
  maxGuests: 2,
  nights: [
    closed('2026-12-18'),
    open('2026-12-19', 8000),
    open('2026-12-20', 8300),
    open('2026-12-21', 8300),
    open('2026-12-22', 8300),
    closed('2026-12-23'),
    open('2026-12-24', 9000),
    open('2026-12-25', 9000),
  ],
}

const opts = (from, to, guests = 2) => ({ from, to, guests, discountPct: 10 })

test('openWindows splits runs of open nights at a gap', () => {
  assert.deepEqual(openWindows(orange.nights), [
    { from: '2026-12-19', to: '2026-12-22' },
    { from: '2026-12-24', to: '2026-12-25' },
  ])
})

test('openWindows splits on a missing day, not only on a closed one', () => {
  assert.deepEqual(openWindows([open('2026-12-01', 1), open('2026-12-03', 1)]), [
    { from: '2026-12-01', to: '2026-12-01' },
    { from: '2026-12-03', to: '2026-12-03' },
  ])
})

test('openWindows of no open nights is empty', () => {
  assert.deepEqual(openWindows([closed('2026-12-01')]), [])
  assert.deepEqual(openWindows([]), [])
})

test('idle without dates: discounted fromCents and first window', () => {
  assert.deepEqual(unitState(orange, { guests: 2, discountPct: 10 }), {
    state: 'idle',
    fromCents: 7200,
    nextWindow: { from: '2026-12-19', to: '2026-12-22' },
  })
})

test('idle with only one date', () => {
  assert.equal(unitState(orange, opts('2026-12-20', undefined)).state, 'idle')
})

test('idle with no open nights has no fromCents and no window', () => {
  const s = unitState({ maxGuests: 2, nights: [closed('2026-12-20')] }, { guests: 2, discountPct: 10 })
  assert.deepEqual(s, { state: 'idle', fromCents: undefined, nextWindow: undefined })
})

test('available 20–22 Dec for 2 guests mirrors quoteStay', () => {
  assert.deepEqual(unitState(orange, opts('2026-12-20', '2026-12-22')), {
    state: 'available',
    fullCents: 16600,
    totalCents: 14940,
    nights: 2,
  })
})

test('check-out on the first closed day is still available', () => {
  assert.equal(unitState(orange, opts('2026-12-21', '2026-12-23')).state, 'available')
})

test('check-out on a day absent from nights is still available', () => {
  const u = { maxGuests: 2, nights: [open('2026-12-20', 100), open('2026-12-21', 100)] }
  assert.equal(unitState(u, opts('2026-12-20', '2026-12-22')).state, 'available')
})

test('one closed night makes the stay unavailable', () => {
  assert.equal(unitState(orange, opts('2026-12-22', '2026-12-25')).state, 'unavailable')
})

test('a missing night makes the stay unavailable', () => {
  assert.equal(unitState(orange, opts('2026-12-25', '2026-12-28')).state, 'unavailable')
})

test('solo with 2 guests is guests, even when the nights are closed', () => {
  const solo = { maxGuests: 1, nights: [open('2026-12-20', 6500), open('2026-12-21', 6500)] }
  const s = unitState(solo, opts('2026-12-20', '2026-12-22'))
  assert.equal(s.state, 'guests')
  assert.equal(unitState({ maxGuests: 1, nights: [] }, opts('2026-12-20', '2026-12-22')).state, 'guests')
  assert.equal(unitState(solo, opts('2026-12-20', '2026-12-22', 1)).state, 'available')
})

test('guests state carries the 1-guest total when the nights are bookable', () => {
  const solo = { maxGuests: 1, nights: [open('2026-12-20', 6500), open('2026-12-21', 6500)] }
  const s = unitState(solo, opts('2026-12-20', '2026-12-22'))
  assert.deepEqual(s, { state: 'guests', fullCents: 13000, totalCents: 11700, nights: 2 })
})

test('one night is min_stay with the arrival night minimum', () => {
  assert.deepEqual(unitState(orange, opts('2026-12-20', '2026-12-21')), { state: 'min_stay', minStay: 2 })
})

test('min_stay outranks unavailable', () => {
  const u = { maxGuests: 2, nights: [open('2026-12-20', 100, 3), closed('2026-12-21')] }
  assert.deepEqual(unitState(u, opts('2026-12-20', '2026-12-22')), { state: 'min_stay', minStay: 3 })
})

test('min_stay uses m of the arrival night', () => {
  const u = { maxGuests: 2, nights: [open('2026-12-20', 100, 2), open('2026-12-21', 100, 5)] }
  assert.equal(unitState(u, opts('2026-12-20', '2026-12-22')).state, 'available')
})

test('discount rounding matches the server rule', () => {
  const u = { maxGuests: 2, nights: [open('2026-12-20', 8333), open('2026-12-21', 8333)] }
  const s = unitState(u, { from: '2026-12-20', to: '2026-12-22', guests: 2, discountPct: 10 })
  assert.equal(s.fullCents, 16666)
  assert.equal(s.totalCents, 16666 - Math.round(1666.6))
})

test('selectableDates is the union of open nights', () => {
  const other = { maxGuests: 2, nights: [open('2026-12-18', 100), closed('2026-12-19')] }
  const set = selectableDates({ orange, other })
  assert.ok(set.has('2026-12-18'))
  assert.ok(set.has('2026-12-24'))
  assert.ok(!set.has('2026-12-23'))
  assert.equal(set.size, 7)
})

test('bookUrl builds the exact string', () => {
  assert.equal(
    bookUrl('orange', { from: '2026-12-20', to: '2026-12-22', guests: 2 }),
    '/book/orange/?from=2026-12-20&to=2026-12-22&guests=2',
  )
  assert.equal(bookUrl('orange', {}), '/book/orange/')
  assert.equal(bookUrl('solo', { guests: 1 }), '/book/solo/?guests=1')
})

test('sortByState: available first, then guests, min_stay, unavailable; order kept inside groups', () => {
  const ids = ['orange', 'vintage', 'youth', 'solo', 'awesome']
  const states = {
    orange: 'unavailable',
    vintage: 'available',
    youth: 'min_stay',
    solo: 'guests',
    awesome: 'available',
  }
  assert.deepEqual(sortByState(ids, states), ['vintage', 'awesome', 'solo', 'youth', 'orange'])
})

test('parseQuery keeps valid values and silently drops invalid ones', () => {
  assert.deepEqual(parseQuery('?from=2026-12-20&to=2026-12-22&guests=2'), {
    from: '2026-12-20',
    to: '2026-12-22',
    guests: 2,
  })
  assert.deepEqual(parseQuery('?from=2026-02-30&to=nope&guests=7'), {})
  assert.deepEqual(parseQuery('?from=2026-12-22&to=2026-12-20&guests=1'), { from: '2026-12-22', guests: 1 })
  assert.deepEqual(parseQuery(''), {})
})

test('parseQuery respects bounds when given', () => {
  const bounds = { today: '2026-11-17', horizon: '2027-11-17' }
  assert.deepEqual(parseQuery('?from=2026-11-01&to=2026-11-20', bounds), { to: '2026-11-20' })
  assert.deepEqual(parseQuery('?from=2027-11-10&to=2027-11-20', bounds), { from: '2027-11-10' })
})

test('formatEuro drops whole cents, keeps two decimals otherwise', () => {
  assert.equal(formatEuro(7500), '€75')
  assert.equal(formatEuro(7470), '€74.70')
  assert.equal(formatEuro(16600), '€166')
  assert.equal(formatEuro(123456), '€1,234.56')
})

test('formatEuroTotal always shows two decimals', () => {
  assert.equal(formatEuroTotal(14940), '€149.40')
  assert.equal(formatEuroTotal(15000), '€150.00')
  assert.equal(formatEuroTotal(123400), '€1,234.00')
})

test('formatRange', () => {
  assert.equal(formatRange('2026-12-15', '2027-01-08'), '15 Dec – 8 Jan')
  assert.equal(formatRange('2026-12-20', '2026-12-22'), '20–22 Dec')
  assert.equal(formatRange('2026-12-20', '2026-12-20'), '20 Dec')
})

test('date helpers and city tax', () => {
  assert.equal(addDaysIso('2026-12-31', 1), '2027-01-01')
  assert.equal(nightsBetween('2026-12-20', '2026-12-22'), 2)
  assert.equal(cityTaxCents(2, 2), 1000)
})

// ---- /book/<id>/ panel helpers (quote-driven) ----

const quote = {
  unit: 'orange',
  checkIn: '2026-12-20',
  checkOut: '2026-12-22',
  guests: 2,
  ok: true,
  nights: 2,
  perNight: [
    { date: '2026-12-20', priceCents: 8300 },
    { date: '2026-12-21', priceCents: 8300 },
  ],
  subtotalCents: 16600,
  discountCents: 1660,
  totalCents: 14940,
  cityTaxCents: 1000,
  freeCancellationUntil: '2026-12-13',
  chargeDate: '2026-12-11',
  payNow: false,
  refundable: true,
}

test('formatEuroTotal (the brief\'s formatEuro) on three values', () => {
  assert.equal(formatEuroTotal(14940), '€149.40')
  assert.equal(formatEuroTotal(1000), '€10.00')
  assert.equal(formatEuroTotal(250), '€2.50')
})

test('formatDateLong and formatStayRange carry the year', () => {
  assert.equal(formatDateLong('2026-12-13'), '13 Dec 2026')
  assert.equal(formatStayRange('2026-12-20', '2026-12-22'), '20 Dec – 22 Dec 2026')
  assert.equal(formatStayRange('2026-12-28', '2027-01-03'), '28 Dec 2026 – 3 Jan 2027')
})

test('stayLine summarises dates, nights and guests', () => {
  assert.equal(stayLine(quote), '20 Dec – 22 Dec 2026 · 2 nights · 2 guests')
  assert.equal(stayLine({ ...quote, guests: 1, nights: 1, checkOut: '2026-12-21' }), '20 Dec – 21 Dec 2026 · 1 night · 1 guest')
})

test('priceLines: one run, discount, total, city tax — all from the quote', () => {
  assert.deepEqual(priceLines(quote), {
    runs: [{ label: '€83 × 2 nights', amount: '€166.00' }],
    discount: { label: 'Direct booking discount −10%', amount: '−€16.60' },
    total: { label: 'Total', amount: '€149.40' },
    cityTax: { label: 'City tax, paid on arrival (€2.50 × 2 guests × 2 nights)', amount: '€10.00' },
  })
})

test('priceLines groups consecutive equal prices only', () => {
  const q = {
    ...quote,
    guests: 1,
    nights: 4,
    perNight: [
      { date: '2026-12-20', priceCents: 8300 },
      { date: '2026-12-21', priceCents: 9050 },
      { date: '2026-12-22', priceCents: 9050 },
      { date: '2026-12-23', priceCents: 8300 },
    ],
    subtotalCents: 34700,
    discountCents: 3470,
    totalCents: 31230,
    cityTaxCents: 1000,
  }
  const lines = priceLines(q)
  assert.deepEqual(lines.runs, [
    { label: '€83 × 1 night', amount: '€83.00' },
    { label: '€90.50 × 2 nights', amount: '€181.00' },
    { label: '€83 × 1 night', amount: '€83.00' },
  ])
  assert.equal(lines.cityTax.label, 'City tax, paid on arrival (€2.50 × 1 guest × 4 nights)')
})

test('priceLines has no discount row when the quote has no discount', () => {
  assert.equal(priceLines({ ...quote, discountCents: 0, totalCents: 16600 }).discount, null)
})

test('policyText by payNow / refundable', () => {
  assert.equal(
    policyText(quote),
    'Free cancellation until 13 Dec 2026. You pay nothing today: your card is charged on 11 Dec 2026.',
  )
  assert.equal(
    policyText({ ...quote, payNow: true, refundable: true }),
    'Free cancellation until 13 Dec 2026. Payment is taken at booking.',
  )
  assert.equal(
    policyText({ ...quote, payNow: true, refundable: false }),
    'This booking is non-refundable, except where the law provides otherwise.',
  )
})

test('quoteMessage for every ok:false reason', () => {
  const no = (reason, extra = {}) => ({ ok: false, reason, ...extra })
  assert.equal(quoteMessage(no('min_stay', { minStay: 3 }), 2), 'Minimum stay is 3 nights for these dates.')
  assert.equal(quoteMessage(no('too_many_guests'), 1), 'This stay is for up to 1 guest.')
  assert.equal(quoteMessage(no('too_many_guests'), 2), 'This stay is for up to 2 guests.')
  assert.equal(quoteMessage(no('unavailable'), 2), 'These dates are not available. Try other dates.')
  assert.equal(quoteMessage(no('closed_arrival'), 2), 'Check-in is not possible on this day.')
  assert.equal(quoteMessage(no('closed_departure'), 2), 'Check-out is not possible on this day.')
  assert.equal(quoteMessage(no('past'), 2), 'Please choose valid dates.')
  assert.equal(quoteMessage(no('invalid_dates'), 2), 'Please choose valid dates.')
  assert.equal(quoteMessage(quote, 2), null)
})

test('requestUrl builds a contact link that parses back', () => {
  const url = requestUrl('Orange room', quote)
  assert.ok(url.startsWith('/contact/?'))
  const params = new URLSearchParams(url.slice('/contact/?'.length))
  assert.deepEqual([...params.keys()], ['service', 'dates', 'message'])
  assert.equal(params.get('service'), 'Apartment')
  assert.equal(params.get('dates'), '20 Dec – 22 Dec 2026, Orange room')
  assert.equal(
    params.get('message'),
    'Direct booking request: Orange room, 20 Dec – 22 Dec 2026, 2 nights, 2 guests. Total €149.40 + €10.00 city tax on arrival.',
  )
})

test('quoteSummary announces the total with pluralised nights', () => {
  assert.equal(quoteSummary(quote), 'Total €149.40 for 2 nights.')
  assert.equal(quoteSummary({ ...quote, nights: 1, totalCents: 7470 }), 'Total €74.70 for 1 night.')
})

test('clampGuests keeps guests within 1..maxGuests', () => {
  assert.equal(clampGuests(2, 1), 1)
  assert.equal(clampGuests(1, 2), 1)
  assert.equal(clampGuests(2, 2), 2)
  assert.equal(clampGuests(0, 2), 1)
  assert.equal(clampGuests(undefined, 1), undefined)
})

// ---- final fix wave ----

test('policyText in request mode: three branches', () => {
  assert.equal(
    policyText(quote, 'request'),
    'Once we confirm your request: free cancellation until 13 Dec 2026, and payment is due on 11 Dec 2026. You pay nothing now.',
  )
  assert.equal(
    policyText({ ...quote, payNow: true, refundable: true }, 'request'),
    'Once we confirm your request: free cancellation until 13 Dec 2026. Payment is due on confirmation.',
  )
  assert.equal(
    policyText({ ...quote, payNow: true, refundable: false }, 'request'),
    'Once we confirm your request, the booking is non-refundable, except where the law provides otherwise. Payment is due on confirmation.',
  )
})

test('policyText defaults to instant mode', () => {
  assert.equal(policyText(quote), policyText(quote, 'instant'))
})

test('unitState: closed-on-arrival night makes the stay unavailable', () => {
  const u = { maxGuests: 2, nights: [{ ...open('2026-12-20', 100), a: 1 }, open('2026-12-21', 100), open('2026-12-22', 100)] }
  assert.deepEqual(unitState(u, opts('2026-12-20', '2026-12-22')), { state: 'unavailable' })
  assert.equal(unitState(u, opts('2026-12-21', '2026-12-23')).state, 'available')
})

test('unitState: closed-on-departure checkout day makes the stay unavailable', () => {
  const u = { maxGuests: 2, nights: [open('2026-12-20', 100), open('2026-12-21', 100), { ...open('2026-12-22', 100), x: 1 }] }
  assert.deepEqual(unitState(u, opts('2026-12-20', '2026-12-22')), { state: 'unavailable' })
  // x only matters on the checkout day, not on a night of the stay.
  assert.equal(unitState(u, opts('2026-12-21', '2026-12-23')).state, 'available')
})

test('unitState: restrictions are checked after guests and min_stay', () => {
  const u = { maxGuests: 1, nights: [{ ...open('2026-12-20', 100), a: 1 }, open('2026-12-21', 100)] }
  assert.deepEqual(unitState(u, opts('2026-12-20', '2026-12-22', 2)), { state: 'guests' })
  assert.deepEqual(unitState(u, opts('2026-12-20', '2026-12-21', 1)), { state: 'min_stay', minStay: 2 })
})

test('priceLines uses discountPct from the quote when present', () => {
  // 1660 / 16600 derives 10; the server said 10 too. Use an odd case where rounding differs.
  const q = { ...quote, perNight: [{ date: '2026-12-20', priceCents: 999 }], nights: 1, guests: 1, subtotalCents: 999, discountCents: 150, totalCents: 849, cityTaxCents: 250 }
  assert.equal(priceLines(q).discount.label, 'Direct booking discount −15%')
  assert.equal(priceLines({ ...q, discountPct: 15 }).discount.label, 'Direct booking discount −15%')
  assert.equal(priceLines({ ...quote, discountPct: 12 }).discount.label, 'Direct booking discount −12%')
  assert.equal(priceLines({ ...quote, discountPct: '12' }).discount.label, 'Direct booking discount −10%')
})

test('stayTooLong: more than 30 nights', () => {
  assert.equal(stayTooLong('2026-12-01', '2026-12-31'), false)
  assert.equal(stayTooLong('2026-12-01', '2027-01-01'), true)
  assert.equal(stayTooLong(undefined, '2027-01-01'), false)
})

test('minStayOnly: smallest minStay when every unit is min_stay, else null', () => {
  assert.equal(minStayOnly({ a: { state: 'min_stay', minStay: 3 }, b: { state: 'min_stay', minStay: 2 } }), 2)
  assert.equal(minStayOnly({ a: { state: 'min_stay', minStay: 3 }, b: { state: 'unavailable' } }), null)
  assert.equal(minStayOnly({}), null)
})
