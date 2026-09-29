export type GalleryType = 'rail' | 'spreads' | 'dissolve' | 'immersive'
export type PhotoHeading = { lead: string; accent: string; tail?: string }
export type PhotoStory = {
  eyebrow: string
  heading: PhotoHeading
  paragraphs: string[]
  items?: string[]
}
export type PhotoSource = {
  id: string
  original: string
  alt: string
  focal: string
  mobileFocal?: string
  thumbFit?: 'contain' | 'cover'
  immersiveFit?: 'contain' | 'cover'
}
export type PhotoAsset = {
  width: number
  height: number
  src: string
  srcset: string
  thumb: string
}
export type PhotoFrame = PhotoSource & PhotoAsset & {
  index: number
  ratio: string
  portrait: boolean
}
export type PhotoChapter = {
  type: GalleryType
  eyebrow: string
  heading: PhotoHeading
  frameIds: string[]
  before: PhotoStory[]
}
export type PhotoshootSource = {
  slug: string
  name: string
  title: string
  description: string
  heading: PhotoHeading
  date: string
  location: string
  summary: string
  schema: { name: string; description: string; datePublished: string; keywords: string[] }
  hero: PhotoSource
  frames: PhotoSource[]
  chapters: PhotoChapter[]
  quote?: { text: string; author: string }
}
export type Photoshoot = Omit<PhotoshootSource, 'hero' | 'frames'> & {
  hero: PhotoFrame
  frames: PhotoFrame[]
}

export const photoStyle = (frame: PhotoSource) => `--focal-point:${frame.focal};--mobile-focal-point:${frame.mobileFocal || frame.focal};--thumb-fit:${frame.thumbFit || 'cover'}`
