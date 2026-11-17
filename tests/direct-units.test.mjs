import test from 'node:test'
import assert from 'node:assert/strict'
import { DIRECT_UNITS, DIRECT_UNIT_IDS, getDirectUnit } from '../src/data/direct-units.mjs'
import {
  ALL_APARTMENTS,
  DIRECT_APARTMENTS,
  PLATFORM_APARTMENTS,
} from '../src/data/apartments.ts'

test('registry id list matches registry keys', () => {
  assert.deepEqual(new Set(DIRECT_UNIT_IDS), new Set(Object.keys(DIRECT_UNITS)))
})
test('apartments: direct ids, guest limits and platform split', () => {
  assert.equal(ALL_APARTMENTS.length, 10)
  assert.deepEqual(DIRECT_APARTMENTS.map((a) => a.id), DIRECT_UNIT_IDS)
  for (const a of DIRECT_APARTMENTS) {
    assert.equal(a.direct.maxGuests, DIRECT_UNITS[a.id].maxGuests)
  }
  assert.deepEqual(
    PLATFORM_APARTMENTS.map((a) => a.id),
    ['villa-susy', 'sunrise-balcony', 'carina', 'harmony', 'royal']
  )
})

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
