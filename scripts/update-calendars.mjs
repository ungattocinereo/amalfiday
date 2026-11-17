import fs from 'node:fs/promises'
import path from 'node:path'

import { buildAvailability } from './lib/ical.mjs'
import {
  ICAL_REGISTRY,
  availabilityRange,
  formatRangeDate,
} from './lib/calendar-registry.mjs'

const main = async () => {
  const { start: rangeStart, end: rangeEnd } = availabilityRange(new Date())

  const calendars = await buildAvailability(ICAL_REGISTRY, rangeStart, rangeEnd)

  const payload = {
    generatedAt: new Date().toISOString(),
    rangeEnd: formatRangeDate(rangeEnd),
    calendars,
  }

  const outputDir = path.join(process.cwd(), 'public', 'calendars')
  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(
    path.join(outputDir, 'availability.json'),
    `${JSON.stringify(payload, null, 2)}\n`
  )

  const total = Object.values(calendars).reduce((sum, days) => sum + days.length, 0)
  console.log(
    `[update-calendars] wrote ${Object.keys(calendars).length} calendars, ${total} busy days through ${payload.rangeEnd}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
