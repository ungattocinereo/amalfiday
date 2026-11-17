// In-process cache for the calendar's Hostex read. Production has no CDN in
// front of the Node server, so without this every visitor of /apartments would
// trigger a 366-day, five-unit Hostex fetch.
//
// - a fresh entry (younger than ttlMs) is returned without calling `load`;
// - concurrent callers for the same key share one in-flight `load`;
// - if `load` fails and an entry younger than staleMs exists, that entry is
//   returned instead of the error, so a short Hostex outage does not blank prices.
//
// Never use it for quotes: a quote must reflect Hostex at the moment it is asked.

const keyOf = ({ unitIds, from, to }) => `${[...unitIds].join(',')}|${from}|${to}`

export function createNightsCache({
  load,
  ttlMs = 60_000,
  staleMs = 600_000,
  maxEntries = 8,
  clock = Date.now,
} = {}) {
  if (typeof load !== 'function') throw new TypeError('createNightsCache needs a load function')
  const entries = new Map() // key -> { at, value }
  const pending = new Map() // key -> Promise

  return async function cachedLoad(args) {
    const key = keyOf(args)
    const hit = entries.get(key)
    if (hit && clock() - hit.at < ttlMs) return hit.value

    const running = pending.get(key)
    if (running) return running

    const promise = (async () => {
      try {
        const value = await load(args)
        entries.delete(key)
        entries.set(key, { at: clock(), value })
        while (entries.size > maxEntries) entries.delete(entries.keys().next().value)
        return value
      } catch (error) {
        const stale = entries.get(key)
        if (stale && clock() - stale.at < staleMs) return stale.value
        throw error
      } finally {
        pending.delete(key)
      }
    })()
    pending.set(key, promise)
    return promise
  }
}
