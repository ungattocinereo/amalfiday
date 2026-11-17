// Pure helpers for the Book direct slideshow (src/components/contact/DirectStay.astro).
// No DOM here, so the rules can be tested with the Node test runner.

export const AUTOPLAY_MS = 5000
export const SWIPE_MIN_PX = 40

/** Index after moving `dir` (+1 / -1) steps from `index`, wrapping around. */
export function stepIndex(index, count, dir = 1) {
  if (!Number.isInteger(count) || count <= 0) return 0
  const from = Number.isInteger(index) ? index : 0
  return (((from + dir) % count) + count) % count
}

/** Clamp / wrap an arbitrary requested index into 0..count-1. */
export function clampIndex(index, count) {
  return stepIndex(index, count, 0)
}

/**
 * Autoplay runs only when nothing asks it to stop: reduced motion, hover,
 * focus inside, the block being off screen, a hidden tab, a manual pause,
 * or a single slide.
 */
export function shouldAutoplay({
  count = 0,
  reducedMotion = false,
  hovered = false,
  focused = false,
  visible = true,
  tabHidden = false,
  userPaused = false,
} = {}) {
  if (count < 2) return false
  return !(reducedMotion || hovered || focused || !visible || tabHidden || userPaused)
}

/** +1 (next) / -1 (previous) / 0 (not a horizontal swipe). */
export function swipeDirection(dx, dy, minPx = SWIPE_MIN_PX) {
  if (Math.abs(dx) < minPx || Math.abs(dx) < Math.abs(dy) * 1.2) return 0
  return dx < 0 ? 1 : -1
}

/** Arrow-key mapping; null for any other key. */
export function keyDirection(key) {
  if (key === 'ArrowRight') return 1
  if (key === 'ArrowLeft') return -1
  return null
}

/** Indexes whose images should be loaded when `index` is shown: current and next. */
export function indexesToLoad(index, count) {
  if (count <= 0) return []
  const a = clampIndex(index, count)
  const b = stepIndex(a, count, 1)
  return a === b ? [a] : [a, b]
}
