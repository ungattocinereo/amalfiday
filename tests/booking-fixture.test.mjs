import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureLoadNights } from '../scripts/lib/booking-fixture.mjs'

test('fixture nights: bookable window per unit, awesome closed, no network', async () => {
  const result = await fixtureLoadNights({
    unitIds: ['orange', 'vintage', 'youth', 'solo', 'awesome'],
    from: '2026-12-14',
    to: '2027-01-09',
  })
  assert.deepEqual(Object.keys(result), ['orange', 'vintage', 'youth', 'solo', 'awesome'])
  const at = (id, date) => result[id].find((n) => n.date === date)

  assert.equal(result.orange.length, 27)
  assert.deepEqual(at('orange', '2026-12-15'), {
    date: '2026-12-15',
    bookable: true,
    priceCents: 8300,
    minStay: 2,
    closedOnArrival: false,
    closedOnDeparture: false,
  })
  assert.equal(at('orange', '2027-01-08').bookable, true)
  assert.equal(at('orange', '2026-12-14').bookable, false)
  assert.equal(at('orange', '2027-01-09').bookable, false)
  assert.equal(at('vintage', '2026-12-20').priceCents, 7800)
  assert.equal(at('youth', '2026-12-20').priceCents, 7900)
  assert.equal(at('solo', '2026-12-20').priceCents, 6500)
  assert.ok(result.awesome.every((n) => n.bookable === false && n.priceCents === null))
})
