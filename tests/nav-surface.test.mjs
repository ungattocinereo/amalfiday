import test from 'node:test'
import assert from 'node:assert/strict'
import { barSurface, blendGradient, luminance, over, parseColor, toneOfLayers } from '../src/scripts/nav/surface.mjs'

const white = [255, 255, 255, 1]

test('parseColor', () => {
  assert.deepEqual(parseColor('rgb(10, 20, 30)'), [10, 20, 30, 1])
  assert.deepEqual(parseColor('rgba(10, 20, 30, 0.5)'), [10, 20, 30, 0.5])
  assert.deepEqual(parseColor('transparent'), [0, 0, 0, 0])
})

test('over and luminance', () => {
  assert.deepEqual(over([0, 0, 0, 0.5], white), [127.5, 127.5, 127.5, 1])
  assert.equal(luminance([0, 0, 0]), 0)
  assert.ok(Math.abs(luminance([255, 255, 255]) - 1) < 1e-9)
})

test('toneOfLayers: dark section over a white page is dark; translucent tint stays light', () => {
  assert.equal(toneOfLayers([[15, 17, 21, 1]], white), 'dark')
  assert.equal(toneOfLayers([[0, 0, 0, 0.1]], white), 'light')
  assert.equal(toneOfLayers([[0, 0, 0, 0]], [15, 17, 21, 1]), 'dark')
})

test('blendGradient: averages gradient stops, ignores image backgrounds', () => {
  const g = blendGradient('linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0))', [0, 0, 0, 0])
  assert.deepEqual(g, [0, 0, 0, 1])
  assert.deepEqual(blendGradient('url(a.jpg), linear-gradient(red, blue)', [1, 2, 3, 1]), [1, 2, 3, 1])
  assert.deepEqual(blendGradient('none', [1, 2, 3, 1]), [1, 2, 3, 1])
})

test('barSurface: majority of three samples; homepage hero is dark until scrolled', () => {
  assert.equal(barSurface(['dark', 'dark', 'light']), 'dark')
  assert.equal(barSurface(['dark', 'light', 'light']), 'light')
  assert.equal(barSurface(['light', 'light', 'light'], { home: true }), 'dark')
  assert.equal(barSurface(['light', 'light', 'light'], { home: true, scrolled: true }), 'light')
})
