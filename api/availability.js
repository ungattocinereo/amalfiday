import { buildAvailability } from '../scripts/lib/ical.mjs'
import { ICAL_REGISTRY, AVAILABILITY_END } from '../scripts/lib/calendar-registry.mjs'

const RANGE_END = new Date(AVAILABILITY_END.year, AVAILABILITY_END.month, AVAILABILITY_END.day)

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

  const now = new Date()
  const rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)

  try {
    const calendars = await buildAvailability(ICAL_REGISTRY, rangeStart, RANGE_END)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    )
    res.status(200).json({
      generatedAt: new Date().toISOString(),
      rangeEnd: '2026-10-31',
      calendars,
    })
  } catch (error) {
    console.error('[api/availability] failed', error)
    res.setHeader('Cache-Control', 'no-store')
    res.status(500).json({ error: 'Failed to build availability' })
  }
}
