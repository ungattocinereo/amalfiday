import ayuna from './photoshoots/ayuna.json'
import camelia from './photoshoots/camelia.json'
import julietta from './photoshoots/julietta.json'
import lashada from './photoshoots/lashada.json'
import loreana from './photoshoots/loreana.json'
import olgaMarat from './photoshoots/olga-marat.json'
import ravello from './photoshoots/ravello-photoshooting.json'
import reganTay from './photoshoots/regan-tay-ravello.json'
import shifa from './photoshoots/shifa.json'
import hinad from './photoshoots/hinad-amalfi-sunrise.json'
import jassi from './photoshoots/jassi-conca-proposal.json'
import jatin from './photoshoots/jatin-sorrento.json'
import nathalie from './photoshoots/nathalie-amalfi.json'
import ashley from './photoshoots/ashley-positano.json'
import nick from './photoshoots/nick-family-praiano.json'
import renaud from './photoshoots/renaud-path-of-the-gods.json'
import sallyRose from './photoshoots/sally-rose-family-positano.json'
import stephanie from './photoshoots/stephanie-positano.json'
import esmeralda from './photoshoots/esmeralda-cortez-amalfi.json'
import anh from './photoshoots/anh-hoang-conca-dei-marini.json'
import nilsa from './photoshoots/nilsa-otanez-amalfi-atrani.json'
import tom from './photoshoots/tom-semb-atrani.json'
import takamasa from './photoshoots/takamasa-shigemi-amalfi-atrani.json'
import assets from './photoshoot-images.json'
import type { PhotoAsset, PhotoFrame, PhotoSource, Photoshoot, PhotoshootSource, PhotoshootCardData } from './photoshoot-types'

export const newPhotoshootSources = [hinad, jassi, jatin, nathalie, ashley, nick, renaud, sallyRose, stephanie, esmeralda, anh, nilsa, tom, takamasa] as PhotoshootSource[]
const sources = [ayuna, camelia, julietta, lashada, loreana, olgaMarat, ravello, reganTay, shifa, ...newPhotoshootSources] as PhotoshootSource[]
const imageAssets = assets as Record<string, Record<string, PhotoAsset>>

export function getPhotoshoot(slug: string): Photoshoot {
  const source = sources.find(shoot => shoot.slug === slug)
  if (!source) throw new Error(`Unknown photoshoot: ${slug}`)
  const prepare = (image: PhotoSource, index: number): PhotoFrame => {
    const asset = imageAssets[slug]?.[image.id]
    if (!asset) throw new Error(`Prepare images before building: ${slug}/${image.id}`)
    return { ...image, ...asset, index, ratio: `${asset.width} / ${asset.height}`, portrait: asset.height > asset.width }
  }
  const frameIds = source.frames.map(frame => frame.id)
  const assigned = source.chapters.flatMap(chapter => chapter.frameIds)
  if (source.chapters.length !== 3 || source.chapters.some(chapter => !chapter.frameIds.length)
    || new Set(frameIds).size !== frameIds.length || new Set(assigned).size !== assigned.length
    || assigned.length !== frameIds.length || assigned.some(id => !frameIds.includes(id))) {
    throw new Error(`Each photograph must appear in exactly one of three chapters: ${slug}`)
  }
  return { ...source, hero: prepare(source.hero, -1), frames: source.frames.map(prepare) }
}

export function getPhotoshootCard(slug: string): PhotoshootCardData {
  const shoot = getPhotoshoot(slug)
  const cover = shoot.card ? [shoot.hero, ...shoot.frames].find(frame => frame.id === shoot.card?.frameId) : shoot.hero
  if (!cover) throw new Error(`Missing card image for ${slug}`)
  const hover = shoot.card?.hover
  const hoverFrame = hover && [shoot.hero, ...shoot.frames].find(frame => frame.id === hover.frameId)
  if (hover && !hoverFrame) throw new Error(`Missing hover image for ${slug}`)
  return {
    title: shoot.name,
    location: shoot.location,
    desc: shoot.summary,
    href: `/photoshootings/${slug}/`,
    image: cover.src,
    hoverImage: hoverFrame?.src,
    hoverSrcset: hoverFrame?.srcset,
    hoverWidth: hoverFrame?.width,
    hoverHeight: hoverFrame?.height,
    hoverFocal: hover?.focal,
    hoverMobileFocal: hover?.mobileFocal || hover?.focal,
    srcset: cover.srcset,
    width: cover.width,
    height: cover.height,
    alt: cover.alt,
    tag: shoot.tag || 'Personal',
    focal: shoot.card?.focal || cover.focal,
    mobileFocal: shoot.card?.mobileFocal || shoot.card?.focal || cover.mobileFocal || cover.focal,
  }
}
