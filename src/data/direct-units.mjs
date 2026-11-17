// Registry of units that accept direct bookings (via Hostex).
// Plain ESM on purpose: imported by Astro pages and by Node serverless functions.
// Contains no secrets; the repository is public.

export const DIRECT_UNITS = Object.freeze({
  vintage: Object.freeze({
    hostexPropertyId: 12843798,
    airbnbListingId: '1491803199632820467',
    maxGuests: 2,
    label: 'Vintage interior',
  }),
  orange: Object.freeze({
    hostexPropertyId: 12843799,
    airbnbListingId: '1622640206186838346',
    maxGuests: 2,
    label: 'Orange room',
  }),
  solo: Object.freeze({
    hostexPropertyId: 12843800,
    airbnbListingId: '1623848144637841636',
    maxGuests: 1,
    label: 'Room for solo traveller',
  }),
  youth: Object.freeze({
    hostexPropertyId: 12843801,
    airbnbListingId: '1624089061068359230',
    maxGuests: 2,
    label: 'Room for youngsters',
  }),
  awesome: Object.freeze({
    hostexPropertyId: 12843803,
    airbnbListingId: '3456236',
    maxGuests: 2,
    label: 'Awesome apartments',
  }),
})

export const DIRECT_UNIT_IDS = Object.freeze(['orange', 'vintage', 'youth', 'solo', 'awesome'])

export function getDirectUnit(id) {
  if (typeof id !== 'string' || !Object.hasOwn(DIRECT_UNITS, id)) return null
  return DIRECT_UNITS[id]
}
