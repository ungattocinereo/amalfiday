import fs from 'node:fs/promises'
import path from 'node:path'

const CAL_URLS = {
  'Casa Carina': [
    'https://www.airbnb.com/calendar/ical/20551225.ics?s=dbbc3c718fa519684c8b4bc62d4e0708',
  ],
  'Awesome Apts': [
    'https://www.airbnb.com/calendar/ical/3456236.ics?s=b68c893b2de331892cf36544c1c12e63',
  ],
  'Solo Room': [
    'https://www.airbnb.com/calendar/ical/40656947.ics?s=32a0a26548f45a0cfd7ceef309386670',
    'https://ical.booking.com/v1/export?t=4c59c943-cb74-4bb7-8a82-8705e8817040',
  ],
  'Central Room': [
    'https://www.airbnb.com/calendar/ical/51476440.ics?s=8aa4cfd91b03146a7c1d0964082103fc',
    'https://ical.booking.com/v1/export?t=a1a50e38-9d9b-429f-89f2-be213d3274a4',
  ],
  'Bunkbed Room': [
    'https://www.airbnb.com/calendar/ical/40275407.ics?s=bb8ad032ac08619aa22ff7c02f71a995',
    'https://ical.booking.com/v1/export?t=b7023f35-c3ae-44bb-b122-ddc15f4d7e26',
  ],
  'Vintage Room': [
    'https://www.airbnb.com/calendar/ical/44026120.ics?s=2bb0f9f20b0e70aae7fad507a9e435b2',
    'https://ical.booking.com/v1/export?t=e7b18790-16b3-4000-b2e0-c4b5076f20d5',
  ],
  'Orange Room': [
    'https://www.airbnb.com/calendar/ical/44055993.ics?s=5d6018e52f24ff88c62007a9033c9e79',
    'https://ical.booking.com/v1/export?t=adda9f47-765e-4342-9bd3-632f0bfe031e',
  ],
  'Harmony Suite': [
    'https://www.airbnb.com/calendar/ical/37988248.ics?s=6146074b67a4454d6bb616ce31309606',
  ],
  'Royal Suite': [
    'https://www.airbnb.com/calendar/ical/973032288955949308.ics?s=bca25b1a63503b216e54dd0d673c9e31',
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
