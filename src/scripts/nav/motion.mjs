// Pure helpers for the header and the desktop menu. No DOM access, so they run under node:test.

/**
 * A critically or under-damped spring (mass 1) sampled into a CSS `linear()` easing.
 * Returns the easing and the time the spring needs to settle within 0.1% of its target.
 */
export function springEasing(stiffness, damping, steps = 40) {
  const w0 = Math.sqrt(stiffness)
  const zeta = damping / (2 * w0)
  const position = (t) => {
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta)
      return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t)
  }
  let duration = 0.05
  while (Math.abs(1 - position(duration)) > 0.001 && duration < 2) duration += 0.01
  const points = Array.from({ length: steps + 1 }, (_, i) => +position((duration * i) / steps).toFixed(4))
  points[0] = 0
  points[steps] = 1
  return { easing: `linear(${points.join(',')})`, ms: Math.round(duration * 1000) }
}

/**
 * Centre a panel under its trigger, clamped to the viewport.
 * All inputs are viewport pixels; `x` and `originX` are relative to the nav element.
 */
export function placePanel({ triggerLeft, triggerWidth, panelWidth, navLeft, viewportWidth, margin = 16 }) {
  const centre = triggerLeft + triggerWidth / 2
  const maxLeft = Math.max(margin, viewportWidth - panelWidth - margin)
  const left = Math.min(Math.max(centre - panelWidth / 2, margin), maxLeft)
  return { x: left - navLeft, originX: centre - left }
}

/** +1 when the next panel sits to the right of the open one, -1 to the left, 0 on first open. */
export function transitionDirection(order, fromId, toId) {
  if (!fromId || fromId === toId) return 0
  const from = order.indexOf(fromId)
  const to = order.indexOf(toId)
  if (from < 0 || to < 0) return 0
  return to > from ? 1 : -1
}

/** Compact capsule sizes. They are fixed, so the capsule never chases animated widths. */
export const COMPACT = Object.freeze({
  border: 1,
  padStart: 10,
  padEnd: 6,
  logo: 38,
  gap: 12,
  actionsGap: 6,
  theme: 40,
  /** CTA side padding goes from 18px to 16px. */
  ctaShrink: 4,
})

/**
 * Width of the collapsed bar: monogram + menu + CTA + theme button with their compact sizes.
 * `ctaWidth` is the CTA's current width; pass `ctaIsCompact` when it was measured collapsed.
 */
export function compactBarWidth({ navWidth, ctaWidth, ctaIsCompact = false }, sizes = COMPACT) {
  const cta = ctaWidth - (ctaIsCompact ? 0 : sizes.ctaShrink)
  const actions = cta + sizes.actionsGap + sizes.theme
  return Math.ceil(
    sizes.border * 2 + sizes.padStart + sizes.logo + sizes.gap + navWidth + sizes.gap + actions + sizes.padEnd,
  )
}

/** Scroll state with hysteresis, so the morph does not flicker near the threshold. */
export function nextScrolled(scrollY, scrolled, enterAt = 48, leaveAt = 16) {
  return scrollY > (scrolled ? leaveAt : enterAt)
}
