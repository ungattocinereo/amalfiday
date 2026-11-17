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
