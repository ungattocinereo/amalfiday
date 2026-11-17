import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COMPACT,
  compactBarWidth,
  nextScrolled,
  placePanel,
  springEasing,
  transitionDirection,
} from '../src/scripts/nav/motion.mjs'

const points = (easing) => easing.slice('linear('.length, -1).split(',').map(Number)

test('springEasing: linear() from 0 to 1 with the requested number of steps', () => {
  const { easing, ms } = springEasing(660, 52)
  assert.match(easing, /^linear\(/)
  const p = points(easing)
  assert.equal(p.length, 41)
  assert.equal(p[0], 0)
  assert.equal(p.at(-1), 1)
  assert.ok(ms > 100 && ms < 1000, `settle time ${ms}`)
  assert.equal(points(springEasing(500, 40, 10).easing).length, 11)
})

test('springEasing: an under-damped spring overshoots, a critically damped one does not', () => {
  // 450/43 → zeta ≈ 1.01 (no overshoot); 300/10 → zeta ≈ 0.29 (overshoots)
  assert.ok(Math.max(...points(springEasing(450, 43).easing)) <= 1)
  assert.ok(Math.max(...points(springEasing(300, 10).easing)) > 1)
})

test('springEasing: stiffer springs settle sooner', () => {
  assert.ok(springEasing(900, 60).ms < springEasing(200, 28).ms)
})

test('placePanel: centres the panel under the trigger', () => {
  const r = placePanel({ triggerLeft: 600, triggerWidth: 100, panelWidth: 400, navLeft: 400, viewportWidth: 1440 })
  // centre 650 → left 450, relative to nav 50, origin 200 inside the panel
  assert.deepEqual(r, { x: 50, originX: 200 })
})

test('placePanel: clamps to the right edge and moves the origin to the trigger', () => {
  const r = placePanel({ triggerLeft: 1300, triggerWidth: 100, panelWidth: 760, navLeft: 300, viewportWidth: 1440 })
  // max left = 1440 - 760 - 16 = 664
  assert.equal(r.x, 664 - 300)
  assert.equal(r.originX, 1350 - 664)
})

test('placePanel: clamps to the left edge, and narrow viewports keep the margin', () => {
  assert.equal(placePanel({ triggerLeft: 20, triggerWidth: 60, panelWidth: 500, navLeft: 0, viewportWidth: 1440 }).x, 16)
  assert.equal(placePanel({ triggerLeft: 200, triggerWidth: 60, panelWidth: 900, navLeft: 0, viewportWidth: 800 }).x, 16)
})

test('transitionDirection', () => {
  const order = ['a', 'b', 'c']
  assert.equal(transitionDirection(order, null, 'b'), 0)
  assert.equal(transitionDirection(order, 'a', 'c'), 1)
  assert.equal(transitionDirection(order, 'c', 'b'), -1)
  assert.equal(transitionDirection(order, 'b', 'b'), 0)
  assert.equal(transitionDirection(order, 'x', 'b'), 0)
})

test('compactBarWidth: sums the fixed compact sizes', () => {
  const fixed = 2 * COMPACT.border + COMPACT.padStart + COMPACT.logo + 2 * COMPACT.gap + COMPACT.actionsGap + COMPACT.theme + COMPACT.padEnd
  assert.equal(compactBarWidth({ navWidth: 500, ctaWidth: 140 }), fixed + 500 + 140 - COMPACT.ctaShrink)
  assert.equal(compactBarWidth({ navWidth: 500, ctaWidth: 136, ctaIsCompact: true }), fixed + 500 + 136)
})

test('compactBarWidth: the same result whichever state the CTA was measured in', () => {
  assert.equal(
    compactBarWidth({ navWidth: 512.4, ctaWidth: 150 }),
    compactBarWidth({ navWidth: 512.4, ctaWidth: 146, ctaIsCompact: true }),
  )
})

test('nextScrolled: hysteresis between 16px and 48px', () => {
  assert.equal(nextScrolled(30, false), false)
  assert.equal(nextScrolled(49, false), true)
  assert.equal(nextScrolled(30, true), true)
  assert.equal(nextScrolled(10, true), false)
})
