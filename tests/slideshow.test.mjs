import test from 'node:test'
import assert from 'node:assert/strict'
import {
  stepIndex,
  clampIndex,
  shouldAutoplay,
  swipeDirection,
  keyDirection,
  indexesToLoad,
  AUTOPLAY_MS,
} from '../src/scripts/slideshow.mjs'

test('stepIndex wraps in both directions', () => {
  assert.equal(stepIndex(0, 4, 1), 1)
  assert.equal(stepIndex(3, 4, 1), 0)
  assert.equal(stepIndex(0, 4, -1), 3)
  assert.equal(stepIndex(2, 4, -1), 1)
})

test('stepIndex survives empty or bad input', () => {
  assert.equal(stepIndex(0, 0, 1), 0)
  assert.equal(stepIndex(undefined, 3, 1), 1)
  assert.equal(stepIndex(NaN, 3, -1), 2)
})

test('clampIndex wraps out-of-range indexes', () => {
  assert.equal(clampIndex(5, 4), 1)
  assert.equal(clampIndex(-1, 4), 3)
  assert.equal(clampIndex(2, 4), 2)
})

test('shouldAutoplay: runs only when nothing blocks it', () => {
  assert.equal(shouldAutoplay({ count: 6 }), true)
  assert.equal(shouldAutoplay({ count: 1 }), false)
  assert.equal(shouldAutoplay({ count: 6, reducedMotion: true }), false)
  assert.equal(shouldAutoplay({ count: 6, hovered: true }), false)
  assert.equal(shouldAutoplay({ count: 6, focused: true }), false)
  assert.equal(shouldAutoplay({ count: 6, visible: false }), false)
  assert.equal(shouldAutoplay({ count: 6, tabHidden: true }), false)
  assert.equal(shouldAutoplay({ count: 6, userPaused: true }), false)
})

test('swipeDirection: horizontal swipes only', () => {
  assert.equal(swipeDirection(-80, 5), 1)
  assert.equal(swipeDirection(80, 5), -1)
  assert.equal(swipeDirection(20, 0), 0)
  assert.equal(swipeDirection(-60, 90), 0)
})

test('keyDirection maps arrows only', () => {
  assert.equal(keyDirection('ArrowRight'), 1)
  assert.equal(keyDirection('ArrowLeft'), -1)
  assert.equal(keyDirection('Enter'), null)
})

test('indexesToLoad returns current and next', () => {
  assert.deepEqual(indexesToLoad(0, 6), [0, 1])
  assert.deepEqual(indexesToLoad(5, 6), [5, 0])
  assert.deepEqual(indexesToLoad(0, 1), [0])
  assert.deepEqual(indexesToLoad(0, 0), [])
})

test('autoplay interval is 5 seconds', () => {
  assert.equal(AUTOPLAY_MS, 5000)
})
