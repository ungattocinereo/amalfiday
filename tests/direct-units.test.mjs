import test from 'node:test'
import assert from 'node:assert/strict'
import { DIRECT_UNITS, DIRECT_UNIT_IDS, getDirectUnit } from '../src/data/direct-units.mjs'

test('five direct units, central excluded', () => {
  assert.deepEqual(DIRECT_UNIT_IDS, ['orange', 'vintage', 'youth', 'solo', 'awesome'])
  assert.equal(getDirectUnit('central'), null)
  assert.equal(getDirectUnit('__proto__'), null)
})
test('guest limits', () => {
  assert.equal(DIRECT_UNITS.solo.maxGuests, 1)
  for (const id of ['orange', 'vintage', 'youth', 'awesome']) assert.equal(DIRECT_UNITS[id].maxGuests, 2)
})
test('hostex mapping', () => {
  assert.equal(DIRECT_UNITS.orange.hostexPropertyId, 12843799)
  assert.equal(DIRECT_UNITS.awesome.airbnbListingId, '3456236')
  assert.ok(!Object.values(DIRECT_UNITS).some((u) => u.hostexPropertyId === 12843802))
})
