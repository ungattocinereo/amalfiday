// Pure colour maths used to pick light or dark lettering for the bar.

/** `rgb()`/`rgba()` → [r, g, b, a]; anything else is transparent. */
export function parseColor(value) {
  const channels = value?.match(/[\d.]+/g)?.map(Number)
  return value?.startsWith('rgb') && channels?.length >= 3 ? [...channels.slice(0, 3), channels[3] ?? 1] : [0, 0, 0, 0]
}

/** Composite `front` over an opaque `back`. */
export function over(front, back) {
  return [...front.slice(0, 3).map((channel, i) => channel * front[3] + back[i] * (1 - front[3])), 1]
}

/** WCAG relative luminance of an [r, g, b] colour. */
export function luminance(color) {
  return color.slice(0, 3).reduce((total, channel, i) => {
    const value = channel / 255
    const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    return total + linear * [0.2126, 0.7152, 0.0722][i]
  }, 0)
}

/** Average the colour stops of a CSS gradient on top of the layer colour, keeping transparency. */
export function blendGradient(backgroundImage, color) {
  if (!backgroundImage?.includes('gradient(') || backgroundImage.includes('url(')) return color
  const stops = [...backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map((match) => parseColor(match[0]))
  if (!stops.length) return color
  const average = [0, 1, 2, 3].map((i) => stops.reduce((sum, stop) => sum + stop[i], 0) / stops.length)
  const alpha = average[3] + color[3] * (1 - average[3])
  if (!alpha) return color
  return [...average.slice(0, 3).map((v, i) => (v * average[3] + color[i] * color[3] * (1 - average[3])) / alpha), alpha]
}

/** Layers listed from the element outwards; returns 'dark' or 'light'. */
export function toneOfLayers(layers, fallback) {
  const background = [...layers].reverse().reduce((back, front) => over(front, back), fallback)
  return luminance(background) < 0.18 ? 'dark' : 'light'
}

/** Majority vote of the sampled tones, with the homepage hero forced dark before scrolling. */
export function barSurface(tones, { home = false, scrolled = false } = {}) {
  if (home && !scrolled) return 'dark'
  return tones.filter((tone) => tone === 'dark').length >= 2 ? 'dark' : 'light'
}
