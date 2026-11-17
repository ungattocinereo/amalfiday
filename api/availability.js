import { buildAvailability } from '../scripts/lib/ical.mjs'
import {
  ICAL_REGISTRY,
  availabilityRange,
  formatRangeDate,
} from '../scripts/lib/calendar-registry.mjs'

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { start: rangeStart, end: rangeEnd } = availabilityRange(new Date())

  try {
    const calendars = await buildAvailability(ICAL_REGISTRY, rangeStart, rangeEnd)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    )
    res.status(200).json({
      generatedAt: new Date().toISOString(),
      rangeEnd: formatRangeDate(rangeEnd),
      calendars,
    })
  } catch (error) {
    console.error('[api/availability] failed', error)
    res.setHeader('Cache-Control', 'no-store')
    res.status(500).json({ error: 'Failed to build availability' })
  }
}
