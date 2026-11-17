// Halftone screen lit by two lights. Pure geometry in `halftoneDots` (tested);
// `drawHalftoneLights` only paints what it returns.

const STEP = 9
const SPARKLE_RATE = 0.008

/** Deterministic PRNG so sparkles stay put between repaints. */
function prng(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/**
 * @param {number} w
 * @param {number} h
 * @param {{ fadeLeft?: boolean }} [options]
 * @returns {{ x: number, y: number, r: number, a: number, warm: number }[]}
 */
export function halftoneDots(w, h, options = {}) {
  const dots = []
  if (!(w > 0 && h > 0)) return dots
  const diag = Math.hypot(w, h)
  const lights = [
    { x: w * 0.78, y: h * 0.12, strength: 1, reach: 0.75, warm: true },
    { x: w * 0.12, y: h * 0.95, strength: 0.55, reach: 0.45, warm: false },
  ]
  const rand = prng(7)
  for (let y = STEP / 2, row = 0; y < h; y += STEP, row += 1) {
    const shift = (row % 2) * (STEP / 2)
    for (let x = STEP / 2 + shift; x < w; x += STEP) {
      let r = 0
      let warm = 0
      for (const light of lights) {
        const d = Math.hypot(x - light.x, y - light.y) / (diag * light.reach)
        r = Math.max(r, light.strength * 2.8 * (1 - d) - 0.3)
        if (light.warm) warm = Math.max(0, 1 - d * 2.2)
      }
      const sparkle = rand() < SPARKLE_RATE && r > 0.4
      if (sparkle) r += 1.8
      if (r <= 0.05) continue
      // Behind a left-hand text column the dots fade to a quarter.
      const fade = options.fadeLeft ? Math.min(1, Math.max(0.25, (x / w - 0.08) / 0.5)) : 1
      const a = Math.min(1, (sparkle ? 0.4 : 0.19) * 1.6 * fade)
      dots.push({ x, y, r, a, warm })
    }
  }
  return dots
}

export function drawHalftoneLights(ctx, w, h, options = {}) {
  for (const d of halftoneDots(w, h, options)) {
    ctx.globalAlpha = d.a
    ctx.fillStyle = d.warm > 0 ? `rgb(255,${Math.round(255 - d.warm * 25)},${Math.round(255 - d.warm * 120)})` : '#ffffff'
    ctx.beginPath()
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}
