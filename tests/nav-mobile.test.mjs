import test from 'node:test'
import assert from 'node:assert/strict'
import { dragOffset, nextOpenCard, shouldDismiss } from '../src/scripts/nav/mobile-gesture.mjs'
import { MENU_STATE, isMenuState, isPlainNavigation, planClose } from '../src/scripts/nav/mobile-history.mjs'

test('dragOffset: follows downward travel, never moves up', () => {
  assert.equal(dragOffset(120), 120)
  assert.equal(dragOffset(-30), 0)
  assert.equal(dragOffset(0), 0)
})

test('shouldDismiss: long slow drag closes, short slow drag does not', () => {
  assert.equal(shouldDismiss({ dy: 300, dt: 2000, height: 800 }), true)
  assert.equal(shouldDismiss({ dy: 150, dt: 2000, height: 800 }), false)
  assert.equal(shouldDismiss({ dy: 60, dt: 1500, height: 800 }), false)
})

test('shouldDismiss: a quick flick closes after a short distance', () => {
  assert.equal(shouldDismiss({ dy: 50, dt: 60, height: 800 }), true)
  assert.equal(shouldDismiss({ dy: 20, dt: 10, height: 800 }), false) // too short even if fast
  assert.equal(shouldDismiss({ dy: 50, dt: 400, height: 800 }), false) // too slow
})

test('shouldDismiss: upward or zero movement never closes, zero dt is safe', () => {
  assert.equal(shouldDismiss({ dy: -200, dt: 50 }), false)
  assert.equal(shouldDismiss({ dy: 0, dt: 0 }), false)
  assert.equal(shouldDismiss({ dy: 80, dt: 0 }), true)
})

test('shouldDismiss: the distance threshold scales with a small sheet but keeps a floor', () => {
  assert.equal(shouldDismiss({ dy: 100, dt: 3000, height: 200 }), true)
  assert.equal(shouldDismiss({ dy: 90, dt: 3000, height: 200 }), false)
})

test('nextOpenCard: one card at a time, tapping the open one closes it', () => {
  assert.equal(nextOpenCard(null, 'a'), 'a')
  assert.equal(nextOpenCard('a', 'b'), 'b')
  assert.equal(nextOpenCard('b', 'b'), null)
})

test('isMenuState recognises only our history entry', () => {
  assert.equal(isMenuState(MENU_STATE), true)
  assert.equal(isMenuState(null), false)
  assert.equal(isMenuState({ other: 1 }), false)
})

test('planClose: pops our entry only when it is on top', () => {
  assert.equal(planClose({ source: 'button', state: MENU_STATE }), 'back')
  assert.equal(planClose({ source: 'button', state: null }), 'direct')
  assert.equal(planClose({ source: 'popstate', state: null }), 'direct')
  assert.equal(planClose({ source: 'popstate', state: MENU_STATE }), 'direct')
  assert.equal(planClose({ source: 'link', state: MENU_STATE }), 'back-then-go')
  assert.equal(planClose({ source: 'link', state: { x: 1 } }), 'direct')
})

test('isPlainNavigation: modifier keys, other buttons and new tabs are left to the browser', () => {
  assert.equal(isPlainNavigation({ button: 0 }), true)
  assert.equal(isPlainNavigation({ button: 0, target: '_self' }), true)
  assert.equal(isPlainNavigation({ button: 1 }), false)
  assert.equal(isPlainNavigation({ button: 0, metaKey: true }), false)
  assert.equal(isPlainNavigation({ button: 0, target: '_blank' }), false)
  assert.equal(isPlainNavigation({ button: 0, download: '' }), false)
})
