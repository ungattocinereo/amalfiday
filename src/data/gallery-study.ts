// One sequence, repeated in four treatments so the designs can be compared.
const base = '/photoshootings/individual/Loreana/'
export const galleryHero = `${base}HERO-Loreana-photoshooting-in-amalfi-ravello-september-2025-38.webp`
export const galleryStory = {
  summary: 'A photographic story with Loreana',
  context: ['Solo birthday photoshoot in Ravello, on the Amalfi Coast'],
}
const frames = [
  ['02', 2500, 2000, 'Loreana in Ravello'],
  ['05', 1666, 2499, 'A portrait of Loreana on the Amalfi Coast'],
  ['08', 2499, 1666, 'Loreana, an afternoon in Ravello'],
  ['07', 2000, 2500, 'A moment from Loreana’s solo photoshoot'],
  ['20', 2499, 1999, 'Loreana in the afternoon light'],
  ['10', 2000, 2500, 'A portrait from the Ravello series'],
  ['13', 2499, 1666, 'Loreana exploring Ravello'],
  ['12', 2000, 2500, 'A quiet moment with Loreana'],
  ['23', 2500, 2000, 'An afternoon on the Amalfi Coast'],
  ['29', 1666, 2499, 'Loreana, a birthday to remember'],
  ['33', 2499, 1666, 'A memory from Ravello'],
  ['34', 2000, 2500, 'The final portrait in the sequence'],
] as const

// Focal points belong to the study's Loreana photographs only.
const focalPoints: Record<string, string> = {
  '02': '64% 35%', '05': '52% 15%', '08': '50% 20%',
  '07': '60% 14%', '20': '62% 24%', '10': '50% 32%',
  '13': '50% 8%', '12': '50% 15%', '23': '62% 10%',
  '29': '54% 72%', '33': '49% 8%', '34': '62% 6%',
}

export const galleryFrames = frames.map(([id, width, height, alt], index) => ({
  id,
  index,
  focal: focalPoints[id],
  width,
  height,
  alt,
  ratio: width > height ? (width / height > 1.4 ? '3 / 2' : '5 / 4') : (width / height < 0.72 ? '2 / 3' : '4 / 5'),
  portrait: height > width,
  original: `${base}Loreana-photoshooting-in-amalfi-ravello-september-2025-${id}.webp`,
  src: `/photoshootings/gallery-study/${id}-1440.webp`,
  srcset: `/photoshootings/gallery-study/${id}-720.webp 720w, /photoshootings/gallery-study/${id}-1440.webp 1440w, ${base}Loreana-photoshooting-in-amalfi-ravello-september-2025-${id}.webp ${width}w`,
  thumb: `/photoshootings/gallery-study/${id}-thumb.webp`,
}))
