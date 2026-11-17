import test from 'node:test'
import assert from 'node:assert/strict'
import { contactPrefill, resolveService, SERVICE_BY_TOKEN } from '../src/scripts/contact-prefill.mjs'
import { DIRECT_UNIT_IDS } from '../src/data/direct-units.mjs'

test('service tokens map to select option labels', () => {
  assert.equal(contactPrefill('?service=photoshoot').service, 'Photoshooting')
  assert.equal(contactPrefill('?service=apartment').service, 'Apartment')
  assert.equal(contactPrefill('?service=tour').service, 'Tour')
  assert.equal(contactPrefill('?service=TOUR').service, 'Tour')
})

test('legacy option labels still work', () => {
  assert.equal(contactPrefill('?service=Photoshooting').service, 'Photoshooting')
  assert.equal(contactPrefill('?service=Porters%2Ftaxi').service, 'Porters/taxi')
  assert.equal(resolveService('other'), 'Other')
})

test('unknown or malformed service is ignored', () => {
  for (const q of ['?service=spa', '?service=', '?service=__proto__', '?service=constructor', '']) {
    assert.equal(contactPrefill(q).service, null, q)
  }
  assert.equal(resolveService(null), null)
  assert.equal(resolveService(42), null)
})

test('every token points at a known option', () => {
  for (const label of Object.values(SERVICE_BY_TOKEN)) assert.ok(resolveService(label))
})

test('known unit fills service and message', () => {
  for (const id of DIRECT_UNIT_IDS) {
    const r = contactPrefill(`?unit=${id}`)
    assert.equal(r.unit?.id, id)
    assert.equal(r.service, 'Apartment')
    assert.match(r.message, /^I'd like to book /)
  }
})

test('explicit service wins over the unit default', () => {
  assert.equal(contactPrefill('?service=tour&unit=orange').service, 'Tour')
})

test('unknown unit is ignored', () => {
  for (const q of ['?unit=nope', '?unit=__proto__', '?unit=toString', '?unit=']) {
    const r = contactPrefill(q)
    assert.equal(r.unit, null, q)
    assert.equal(r.service, null, q)
    assert.equal(r.message, '', q)
  }
})

test('dates are kept as plain text', () => {
  assert.equal(contactPrefill('?dates=Oct%203%E2%80%937%2C%20Atrani').dates, 'Oct 3–7, Atrani')
})

test('markup, control characters and length are neutralised', () => {
  const r = contactPrefill(`?dates=${encodeURIComponent('<img src=x onerror=alert(1)>\n\tOct')}`)
  assert.ok(!/[<>\n\t]/.test(r.dates))
  assert.ok(r.dates.endsWith('Oct'))
  assert.equal(contactPrefill(`?dates=${'a'.repeat(500)}`).dates.length, 120)
  const m = contactPrefill(`?message=${encodeURIComponent('<script>x</script>' + 'b'.repeat(900))}`).message
  assert.ok(!/[<>]/.test(m))
  assert.ok(m.length <= 500)
})

test('accepts URLSearchParams and missing input', () => {
  assert.equal(contactPrefill(new URLSearchParams('service=tour')).service, 'Tour')
  assert.deepEqual(contactPrefill(undefined), { service: null, unit: null, dates: '', message: '' })
})
