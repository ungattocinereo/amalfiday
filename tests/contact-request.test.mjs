import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isAskOnly,
  LIMITS,
  buildContactRequest,
  clampGuests,
  formatDateRange,
  isValidContact,
  normalizeServices,
  parseIsoDate,
  whatsappText,
} from '../src/scripts/contact-request.mjs'

const base = { services: ['photoshoot'], from: '2027-06-12', contact: 'anna@example.com' }

test('payload has exactly the API fields', () => {
  const { ok, payload } = buildContactRequest({ ...base, name: 'Anna', message: 'Sunset please' })
  assert.equal(ok, true)
  assert.deepEqual(Object.keys(payload).sort(), ['company_website', 'contact', 'dates', 'message', 'name', 'service'])
  assert.equal(payload.name, 'Anna')
  assert.equal(payload.contact, 'anna@example.com')
  assert.equal(payload.dates, '12 Jun 2027')
  assert.equal(payload.service, 'Photoshoot · 1 guest')
  assert.equal(payload.company_website, '')
  assert.match(payload.message, /Guests: 1/)
  assert.match(payload.message, /\n\nSunset please$/)
})

test('required fields: services, dates or place, contact', () => {
  const r = buildContactRequest({})
  assert.equal(r.ok, false)
  assert.deepEqual(Object.keys(r.errors).sort(), ['contact', 'dates', 'services'])
  assert.equal(r.payload.service, '')
  assert.equal(r.payload.dates, '')
})

test('place alone satisfies dates (flexible timing)', () => {
  const r = buildContactRequest({ ...base, from: '', place: 'Any weekend in June, Positano' })
  assert.equal(r.ok, true)
  assert.equal(r.payload.dates, 'Any weekend in June, Positano')
})

test('date range with nights and place', () => {
  const r = buildContactRequest({ ...base, services: ['stay'], to: '2027-06-15', place: 'Atrani' })
  assert.equal(r.payload.dates, '12 Jun – 15 Jun 2027 (3 nights), Atrani')
  assert.equal(formatDateRange('2027-12-30', '2028-01-02'), '30 Dec 2027 – 2 Jan 2028 (3 nights)')
  assert.equal(formatDateRange('2027-06-12', '2027-06-13'), '12 Jun – 13 Jun 2027 (1 night)')
})

test('end date before start is an error and is not printed', () => {
  const r = buildContactRequest({ ...base, to: '2027-06-10' })
  assert.equal(r.ok, false)
  assert.ok(r.errors.to)
  assert.equal(r.payload.dates, '12 Jun 2027')
})

test('invalid dates are ignored', () => {
  assert.equal(parseIsoDate('2027-02-30'), null)
  assert.equal(parseIsoDate('12/06/2027'), null)
  assert.equal(parseIsoDate(undefined), null)
  assert.equal(formatDateRange('nope', '2027-06-12'), '')
})

test('several services join in service and are listed in message', () => {
  const r = buildContactRequest({ ...base, services: ['tour', 'photoshoot', 'tour', 'spa'], guests: 3 })
  assert.equal(r.payload.service, 'Photoshoot + Tour · 3 guests')
  assert.match(r.payload.message, /^Services: Photoshoot, Tour\nGuests: 3/)
  assert.deepEqual(normalizeServices(['other', 'stay', '__proto__']).map((s) => s.id), ['stay', 'other'])
})

test('room only for Stay, and only when it fits the guests', () => {
  const stay = buildContactRequest({ ...base, services: ['stay'], unit: 'orange', guests: 2 })
  assert.match(stay.payload.message, /Room: Orange room/)
  assert.equal(stay.summary.room, 'Orange room')
  const tooMany = buildContactRequest({ ...base, services: ['stay'], unit: 'solo', guests: 2 })
  assert.match(tooMany.payload.message, /Room: any room/)
  const noStay = buildContactRequest({ ...base, unit: 'orange' })
  assert.doesNotMatch(noStay.payload.message, /Room:/)
  const unknown = buildContactRequest({ ...base, services: ['stay'], unit: 'toString' })
  assert.match(unknown.payload.message, /Room: any room/)
})

test('guests are clamped to 1..12', () => {
  assert.equal(clampGuests('0'), 1)
  assert.equal(clampGuests('abc'), 1)
  assert.equal(clampGuests(40), 12)
  assert.equal(clampGuests('2.6'), 3)
})

test('contact validation: email or phone', () => {
  for (const ok of ['a@b.co', '+39 327 097 2329', '(327) 097-2329']) assert.equal(isValidContact(ok), true, ok)
  for (const bad of ['', 'anna', '12345', 'call me 1234567']) assert.equal(isValidContact(bad), false, bad)
  const r = buildContactRequest({ ...base, contact: 'anna' })
  assert.ok(r.errors.contact)
  const long = buildContactRequest({ ...base, contact: `${'a'.repeat(130)}@example.com` })
  assert.ok(long.errors.contact)
})

test('every field respects the server limits', () => {
  const r = buildContactRequest({
    services: ['photoshoot', 'stay', 'tour', 'other'],
    from: '2027-06-12',
    to: '2027-06-20',
    place: 'x'.repeat(400),
    guests: 12,
    name: 'n'.repeat(300),
    contact: 'anna@example.com',
    message: 'm'.repeat(5000),
  })
  for (const key of ['name', 'contact', 'dates', 'service', 'message']) {
    assert.ok(r.payload[key].length <= LIMITS[key], `${key}: ${r.payload[key].length}`)
  }
  assert.ok(r.payload.dates.endsWith('…'))
  assert.ok(r.payload.message.startsWith('Services: '))
  assert.ok(r.payload.message.endsWith('…'))
})

test('control characters are stripped, newlines kept in the message', () => {
  const r = buildContactRequest({ ...base, name: 'An\u0000na\n', message: 'Line 1\r\nLine 2\u0007' })
  assert.equal(r.payload.name, 'An na')
  assert.match(r.payload.message, /Line 1\nLine 2$/)
})

test('honeypot is passed through untouched', () => {
  assert.equal(buildContactRequest({ ...base, honeypot: 'spam.biz' }).payload.company_website, 'spam.biz')
})

test('WhatsApp follow-up text', () => {
  const { summary } = buildContactRequest({ ...base, place: 'Ravello' })
  assert.equal(whatsappText(summary), 'Hi! I just sent a request on amalfi.day: Photoshoot, 12 Jun 2027, Ravello.')
  assert.equal(whatsappText({}), 'Hi! I just sent a request on amalfi.day.')
})

test('"Ask" alone is a plain question: no dates or guests, the message is required', () => {
  assert.equal(isAskOnly(['other']), true)
  assert.equal(isAskOnly(['other', 'stay']), false)
  assert.equal(isAskOnly([]), false)

  const empty = buildContactRequest({ services: ['other'], contact: 'guest@example.com' })
  assert.equal(empty.ok, false)
  assert.equal(empty.errors.message, 'Write your question.')
  assert.equal(empty.errors.dates, undefined)

  const asked = buildContactRequest({ services: ['other'], contact: 'guest@example.com', message: 'Do you arrange porters?' })
  assert.equal(asked.ok, true)
  assert.equal(asked.payload.service, 'Question')
  assert.equal(asked.payload.dates, 'Not specified')
  assert.equal(asked.payload.message, 'Do you arrange porters?')
  assert.equal(asked.summary.guests, '')
})
