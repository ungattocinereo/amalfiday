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
import assets from './photoshoot-images.json'
import type { PhotoAsset, PhotoFrame, PhotoSource, Photoshoot, PhotoshootSource } from './photoshoot-types'

export const newPhotoshootSources = [hinad, jassi, jatin, nathalie, ashley, nick, renaud, sallyRose, stephanie] as PhotoshootSource[]
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
