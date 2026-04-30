import { site } from './site'

export type PhotoshootSchemaInput = {
  slug: string
  name: string
  description: string
  hero: string
  location: string
  datePublished?: string
  keywords?: string[]
  galleryImages?: { src: string; alt: string }[]
}

const toAbs = (path: string) => new URL(path, site.url).toString()

export function buildPhotoshootSchema(input: PhotoshootSchemaInput) {
  const url = `${site.url}/photoshootings/${input.slug}`
  const images = [
    toAbs(input.hero),
    ...(input.galleryImages?.slice(0, 6).map((g) => toAbs(g.src)) ?? []),
  ]

  const work = {
    '@context': 'https://schema.org',
    '@type': ['CreativeWork', 'Photograph'],
    '@id': `${url}#work`,
    name: input.name,
    description: input.description,
    url,
    image: images,
    creator: { '@id': `${site.url}/#business` },
    author: {
      '@type': 'Person',
      name: 'Greg',
      url: site.url,
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    contentLocation: {
      '@type': 'Place',
      name: input.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: input.location,
        addressRegion: 'SA',
        addressCountry: 'IT',
      },
    },
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    isPartOf: { '@id': `${site.url}/photoshootings#hub` },
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Photoshoots',
        item: `${site.url}/photoshootings`,
      },
      { '@type': 'ListItem', position: 3, name: input.name, item: url },
    ],
  }

  return [work, breadcrumbs]
}
