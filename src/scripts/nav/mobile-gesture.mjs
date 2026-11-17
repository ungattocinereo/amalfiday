// Pure helpers for the mobile sheet: swipe-to-close and the single open card. No DOM access.

/** Finger travel below the start point only; dragging up resists and stops at 0. */
export function dragOffset(dy) {
  return dy > 0 ? dy : 0
}

/**
 * Should a downward drag close the sheet?
 * `dy` px travelled (positive = down), `dt` ms since the pointer went down.
 * Closes on distance (a third of the sheet, at least `minDistance`) or on a quick flick
 * (speed ≥ `minVelocity` px/ms after at least `flickDistance` px).
 */
export function shouldDismiss({ dy, dt, height = 800 }, { minDistance = 96, fraction = 0.33, minVelocity = 0.5, flickDistance = 36 } = {}) {
  if (!(dy > 0)) return false
  if (dy >= Math.max(minDistance, height * fraction)) return true
  const velocity = dy / Math.max(dt, 1)
  return dy >= flickDistance && velocity >= minVelocity
}

/** Accordion with one open card: tapping the open card closes it. */
export function nextOpenCard(current, tapped) {
  return current === tapped ? null : tapped
}
