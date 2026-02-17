import fs from 'node:fs/promises'
import path from 'node:path'

const CAL_URLS = {
  'Awesome Apts': [
    'https://www.airbnb.com/calendar/ical/3456236.ics?s=b68c893b2de331892cf36544c1c12e63',
  ],
  'Solo Room': [
    'https://ical.booking.com/v1/export?t=50eb167d-a617-4f6e-862b-7b474516e903',
  ],
  'Central Room': [
    'https://ical.booking.com/v1/export?t=66c7dc38-0d5e-45dc-b22a-9d8e075ec149',
    'https://ical.booking.com/v1/export?t=9dc9bc5e-c0d8-4727-9a6d-9a769afc138c',
  ],
  'Bunkbed Room': [
    'https://ical.booking.com/v1/export?t=b7023f35-c3ae-44bb-b122-ddc15f4d7e26',
  ],
  'Vintage Room': [
    'https://ical.booking.com/v1/export/t/ea3e0ad0-f516-43af-a678-dd860ca9e8df.ics',
  ],
  'Orange Room': [
    'https://ical.booking.com/v1/export/t/acb8b56c-0940-4aeb-ab6d-3de433afab7f.ics',
  ],
  'Casa Carina': [
    'https://www.airbnb.com/calendar/ical/20551225.ics?s=dbbc3c718fa519684c8b4bc62d4e0708',
  ],
  'Harmony Suite': [
    'https://www.airbnb.com/calendar/ical/37988248.ics?s=6146074b67a4454d6bb616ce31309606',
  ],
  'Royal Suite': [
    'https://www.airbnb.com/calendar/ical/973032288955949308.ics?s=bca25b1a63503b216e54dd0d673c9e31',
  ],
  'Aria di Mare': [
    'https://www.airbnb.com/calendar/ical/565787701411415824.ics?s=19f46a3833e061da73c9f76c96c9a6d3',
  ],
  'Villa Susy': [
    'https://ical.booking.com/v1/export?t=d1d7f32f-23b9-4914-b348-07719a6bd239',
  ],
}

const fetchIcs = async (url) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (AmalfiDay calendar fetcher)',
      Accept: 'text/calendar,*/*',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`)
  }
  return res.text()
}

const parseDate = (value) => {
  const match = value.match(/(\d{4})(\d{2})(\d{2})/)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

const parseIcs = (text) => {
  const startIndex = text.indexOf('BEGIN:VCALENDAR')
  const endIndex = text.indexOf('END:VCALENDAR')
  const slice =
    startIndex >= 0
      ? text.slice(startIndex, endIndex >= 0 ? endIndex + 'END:VCALENDAR'.length : undefined)
      : text
  const normalized = slice.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
  const lines = normalized.split('\n')
  const events = []
  let current = null

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      current = {}
    } else if (line.startsWith('DTSTART')) {
      const value = line.split(':').pop()
      current.start = parseDate(value)
    } else if (line.startsWith('DTEND')) {
      const value = line.split(':').pop()
      current.end = parseDate(value)
    } else if (line.startsWith('END:VEVENT')) {
      if (current?.start && current?.end) {
        events.push(current)
      }
      current = null
    }
  }

  return events
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const collectBusyDates = (events, rangeStart, rangeEnd) => {
  const busy = new Set()
  const addDays = (date, days) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

  events.forEach((event) => {
    let cursor = new Date(event.start)
    const end = new Date(event.end)
    if (cursor >= end) return
    while (cursor < end) {
      if (cursor >= rangeStart && cursor <= rangeEnd) {
        busy.add(formatDate(cursor))
      }
      cursor = addDays(cursor, 1)
    }
  })

  return busy
}

const main = async () => {
  const today = new Date()
  const rangeStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const rangeEnd = new Date(today.getFullYear(), today.getMonth() + 18, 0)
  const calendars = {}

  for (const [name, urls] of Object.entries(CAL_URLS)) {
    const texts = []
    for (const url of urls) {
      try {
        texts.push(await fetchIcs(url))
      } catch (error) {
        console.warn(error)
      }
    }
    if (!texts.length) continue
    const events = texts.flatMap((text) => parseIcs(text))
    const busy = collectBusyDates(events, rangeStart, rangeEnd)
    calendars[name] = Array.from(busy).sort()
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    calendars,
  }

  const outputDir = path.join(process.cwd(), 'public', 'calendars')
  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(
    path.join(outputDir, 'availability.json'),
    `${JSON.stringify(payload, null, 2)}\n`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
