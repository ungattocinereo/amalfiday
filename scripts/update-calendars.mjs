import fs from 'node:fs/promises'
import path from 'node:path'

import { buildAvailability } from './lib/ical.mjs'
import { ICAL_REGISTRY, AVAILABILITY_END } from './lib/calendar-registry.mjs'

const main = async () => {
  const today = new Date()
  const rangeStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const rangeEnd = new Date(AVAILABILITY_END.year, AVAILABILITY_END.month, AVAILABILITY_END.day)

  const calendars = await buildAvailability(ICAL_REGISTRY, rangeStart, rangeEnd)

  const payload = {
    generatedAt: new Date().toISOString(),
    rangeEnd: `${AVAILABILITY_END.year}-${String(AVAILABILITY_END.month + 1).padStart(2, '0')}-${String(AVAILABILITY_END.day).padStart(2, '0')}`,
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
