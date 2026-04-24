// Keep this in sync with src/data/apartments.ts -> ICAL_REGISTRY.
// Consumed by api/availability.js (Vercel serverless) and scripts/update-calendars.mjs (manual fallback).
export const ICAL_REGISTRY = {
  'Villa Susy': [
    'https://ical.booking.com/v1/export?t=d1d7f32f-23b9-4914-b348-07719a6bd239',
  ],
  'Awesome Apts': [
    'https://www.airbnb.com/calendar/ical/3456236.ics?t=eb37cdcccf9a4865b675311c819e0fd2',
  ],
  'Casa Carina': [
    'https://www.airbnb.com/calendar/ical/20551225.ics?t=d02159c760e14554aa6b68ff6c99baf6',
  ],
  'Harmony Suite': [
    'https://www.airbnb.com/calendar/ical/37988248.ics?t=522d3bd9a171444ca1f131daf4c21443',
  ],
  'Royal Suite': [
    'https://www.airbnb.com/calendar/ical/973032288955949308.ics?t=06b2618b55984543b0d88662b90ccffd',
  ],
  'Vintage Room': [
    'https://www.airbnb.com/calendar/ical/1491803199632820467.ics?t=c7afc2b8c66841ddb0a4a34de5861fb0',
    'https://ical.booking.com/v1/export/t/ea3e0ad0-f516-43af-a678-dd860ca9e8df.ics',
  ],
  'Orange Room': [
    'https://www.airbnb.com/calendar/ical/1622640206186838346.ics?t=717921b0057141649a080db157013617',
    'https://ical.booking.com/v1/export/t/acb8b56c-0940-4aeb-ab6d-3de433afab7f.ics',
  ],
  'Solo Room': [
    'https://www.airbnb.com/calendar/ical/1623848144637841636.ics?t=59d5a4dd90cb45da90493feafb555e39',
    'https://ical.booking.com/v1/export/t/5299de87-de9b-499a-a1a2-311fe09f6774.ics',
  ],
  'Bunkbed Room': [
    'https://www.airbnb.com/calendar/ical/1624089061068359230.ics?t=7cbf451bfed643a5a403dd2d9489df63',
    'https://ical.booking.com/v1/export/t/940e8ee6-25a3-4966-9eab-c83b54827e78.ics',
  ],
}

export const AVAILABILITY_END = { year: 2026, month: 10, day: 30 } // November 30, 2026
