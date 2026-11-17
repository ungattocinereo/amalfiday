import test from 'node:test'
import assert from 'node:assert/strict'
import { createNightsCache } from '../scripts/lib/nights-cache.mjs'

const ARGS = { unitIds: ['orange', 'solo'], from: '2026-12-01', to: '2027-12-01', token: 't' }

function setup({ ttlMs = 60_000, staleMs = 600_000, maxEntries } = {}) {
  let now = 1_000_000
  const calls = []
  let fail = false
  const load = async (args) => {
    calls.push(args)
    if (fail) throw new Error('hostex down')
    return { n: calls.length }
  }
  const cached = createNightsCache({ load, ttlMs, staleMs, maxEntries, clock: () => now })
  return {
    cached,
    calls,
    advance: (ms) => { now += ms },
    setFail: (value) => { fail = value },
  }
}

test('a fresh entry is served without calling load again', async () => {
  const { cached, calls, advance } = setup()
  assert.deepEqual(await cached(ARGS), { n: 1 })
  advance(59_999)
  assert.deepEqual(await cached(ARGS), { n: 1 })
  assert.equal(calls.length, 1)
})

test('an expired entry is reloaded', async () => {
  const { cached, calls, advance } = setup()
  await cached(ARGS)
  advance(60_000)
  assert.deepEqual(await cached(ARGS), { n: 2 })
  assert.equal(calls.length, 2)
})

test('concurrent callers share one load', async () => {
  const { cached, calls } = setup()
  const [a, b, c] = await Promise.all([cached(ARGS), cached(ARGS), cached(ARGS)])
  assert.equal(calls.length, 1)
  assert.deepEqual([a, b, c], [{ n: 1 }, { n: 1 }, { n: 1 }])
})

test('a different range is a different entry; the token is not part of the key', async () => {
  const { cached, calls } = setup()
  await cached(ARGS)
  await cached({ ...ARGS, token: 'other' })
  assert.equal(calls.length, 1)
  await cached({ ...ARGS, to: '2027-12-02' })
  assert.equal(calls.length, 2)
})

test('a failed reload falls back to a stale entry, then throws once it is too old', async () => {
  const { cached, calls, advance, setFail } = setup()
  await cached(ARGS)
  setFail(true)
  advance(120_000)
  assert.deepEqual(await cached(ARGS), { n: 1 })
  assert.equal(calls.length, 2)
  advance(480_000) // entry is now 600 s old
  await assert.rejects(() => cached(ARGS), /hostex down/)
})

test('a failure with nothing cached is thrown, and the next call retries', async () => {
  const { cached, calls, setFail } = setup()
  setFail(true)
  await assert.rejects(() => cached(ARGS), /hostex down/)
  setFail(false)
  assert.deepEqual(await cached(ARGS), { n: 2 })
  assert.equal(calls.length, 2)
})

test('the cache keeps at most maxEntries keys', async () => {
  const { cached, calls } = setup({ maxEntries: 2 })
  await cached({ ...ARGS, to: '2027-01-01' })
  await cached({ ...ARGS, to: '2027-01-02' })
  await cached({ ...ARGS, to: '2027-01-03' })
  await cached({ ...ARGS, to: '2027-01-01' }) // evicted, loads again
  assert.equal(calls.length, 4)
})

test('load is required', () => {
  assert.throws(() => createNightsCache({}), TypeError)
})
