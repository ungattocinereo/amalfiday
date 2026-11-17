import test from 'node:test'
import assert from 'node:assert/strict'
import { halftoneDots } from '../src/scripts/halftone-lights.mjs'

test('halftone dots are bigger near the sun than far from both lights', () => {
  const dots = halftoneDots(1200, 800)
  assert.ok(dots.length > 1000)
  const near = dots.filter((d) => Math.hypot(d.x - 936, d.y - 96) < 60 && d.r < 4)
  const far = dots.filter((d) => Math.hypot(d.x - 600, d.y - 400) < 40)
  const avg = (list) => list.reduce((s, d) => s + d.r, 0) / list.length
  assert.ok(near.length && (!far.length || avg(near) > avg(far)))
  assert.ok(near.some((d) => d.warm > 0))
})

test('fadeLeft dims dots behind the text column and the layout is deterministic', () => {
  const plain = halftoneDots(1000, 600)
  const faded = halftoneDots(1000, 600, { fadeLeft: true })
  assert.deepEqual(plain.map((d) => [d.x, d.y, d.r]), faded.map((d) => [d.x, d.y, d.r]))
  const left = (list) => list.filter((d) => d.x < 150).reduce((s, d) => s + d.a, 0)
  assert.ok(left(faded) < left(plain))
  assert.deepEqual(halftoneDots(0, 600), [])
})

test('plainAlpha dims only the plain white dots', () => {
  const full = halftoneDots(1200, 800)
  const quiet = halftoneDots(1200, 800, { plainAlpha: 0.45 })
  full.forEach((d, i) => {
    const q = quiet[i]
    if (d.warm > 0 || d.sparkle) assert.equal(q.a, d.a)
    else assert.ok(Math.abs(q.a - d.a * 0.45) < 1e-9)
  })
})
