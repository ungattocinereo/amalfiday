import test from 'node:test'
import assert from 'node:assert/strict'
import { availabilityRange } from '../scripts/lib/calendar-registry.mjs'
import * as registry from '../scripts/lib/calendar-registry.mjs'

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

test('availabilityRange: mid-month start rolls 12 months forward', () => {
  const { start, end, endLabel } = availabilityRange(new Date(2026, 10, 17))
  assert.equal(ymd(start), '2026-11-01')
  assert.equal(ymd(end), '2027-11-30')
  assert.equal(endLabel, '30 November 2027')
})

test('availabilityRange: end of January ends on 31 January next year', () => {
  const { start, end, endLabel } = availabilityRange(new Date(2027, 0, 31))
  assert.equal(ymd(start), '2027-01-01')
  assert.equal(ymd(end), '2028-01-31')
  assert.equal(endLabel, '31 January 2028')
})

test('availabilityRange: December wraps into the next-next year', () => {
  const { end } = availabilityRange(new Date(2026, 11, 5))
  assert.equal(ymd(end), '2027-12-31')
})

test('availabilityRange: leap-year February end', () => {
  const { end } = availabilityRange(new Date(2027, 1, 10))
  assert.equal(ymd(end), '2028-02-29')
})

test('availabilityRange: defaults to now', () => {
  const now = new Date()
  const { start } = availabilityRange()
  assert.equal(ymd(start), ymd(new Date(now.getFullYear(), now.getMonth(), 1)))
})

test('hard-coded AVAILABILITY_END constant is gone', () => {
  assert.equal('AVAILABILITY_END' in registry, false)
})
