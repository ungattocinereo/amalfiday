export const fetchIcs = async (url) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (AmalfiDay calendar fetcher)',
      Accept: 'text/calendar,*/*',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (${res.status})`)
  }
  return res.text()
}

export const parseDate = (value) => {
  const match = value.match(/(\d{4})(\d{2})(\d{2})/)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export const parseIcs = (text) => {
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

export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const collectBusyDates = (events, rangeStart, rangeEnd) => {
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

export const buildAvailability = async (registry, rangeStart, rangeEnd) => {
  const calendars = {}
  await Promise.all(
    Object.entries(registry).map(async ([name, urls]) => {
      const texts = await Promise.all(
        urls.map((url) =>
          fetchIcs(url).catch((error) => {
            console.warn(`[ical] ${name}: ${error.message}`)
            return null
          })
        )
      )
      const events = texts.filter(Boolean).flatMap((text) => parseIcs(text))
      calendars[name] = Array.from(collectBusyDates(events, rangeStart, rangeEnd)).sort()
    })
  )
  return calendars
}
