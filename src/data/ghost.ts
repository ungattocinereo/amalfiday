/* ------------------------------------------------------------------ *
 *  Ghost Content API — typed fetch wrapper for Astro static build     *
 *  Gracefully returns empty arrays / null when env vars are missing.  *
 * ------------------------------------------------------------------ */

// --- Raw API response types ---

type GhostTag = {
  name: string
  slug: string
}

type GhostAuthor = {
  name: string
  slug: string
  profile_image: string | null
  bio: string | null
}

type GhostPostResponse = {
  id: string
  title: string
  slug: string
  excerpt: string
  published_at: string
  feature_image: string | null
  url: string
  html?: string
  reading_time?: number
  tags?: GhostTag[]
  primary_tag?: GhostTag | null
  authors?: GhostAuthor[]
  primary_author?: GhostAuthor | null
}

// --- Public types ---

export type GhostPost = {
  title: string
  slug: string
  excerpt: string
  date: string
  dateISO: string
  href: string
  image: string | null
  readingTime?: number
  tag?: string
}

export type GhostPostFull = GhostPost & {
  id: string
  html: string
  readingTime: number
  tag: string
  tags: string[]
  author: {
    name: string
    image: string | null
    bio: string | null
  }
}

// --- Helpers ---

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

const buildGhostUrl = (path: string) => {
  const apiUrl = import.meta.env.GHOST_API_URL || process.env.GHOST_API_URL
  if (!apiUrl) return null
  const base = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`
  return new URL(path, base)
}

const getApiKey = () =>
  import.meta.env.GHOST_CONTENT_API_KEY || process.env.GHOST_CONTENT_API_KEY || null

// --- Listing: lightweight posts for index / homepage ---

export const getGhostPosts = async ({ limit = 6 }: { limit?: number } = {}) => {
  const apiKey = getApiKey()
  const url = buildGhostUrl('ghost/api/content/posts/')

  if (!apiKey || !url) {
    console.warn('Ghost API env vars missing: GHOST_API_URL / GHOST_CONTENT_API_KEY')
    return [] as GhostPost[]
  }

  url.searchParams.set('key', apiKey)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('order', 'published_at desc')
  url.searchParams.set(
    'fields',
    'title,slug,excerpt,published_at,feature_image,url,reading_time'
  )
  url.searchParams.set('include', 'tags')

  try {
    const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
    if (!response.ok) {
      console.warn(`Ghost API error: ${response.status}`)
      return [] as GhostPost[]
    }

    const data = (await response.json()) as { posts?: GhostPostResponse[] }
    return (data.posts ?? []).map((post): GhostPost => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      date: formatDate(post.published_at),
      dateISO: post.published_at,
      href: `/blog/${post.slug}`,
      image: post.feature_image ?? null,
      readingTime: post.reading_time ?? undefined,
      tag: post.primary_tag?.name ?? post.tags?.[0]?.name ?? undefined,
    }))
  } catch (error) {
    console.warn('Ghost API fetch failed', error)
    return [] as GhostPost[]
  }
}

// --- Full posts with HTML: for [slug] pages and getStaticPaths ---

export const getGhostPostsFull = async ({ limit = 'all' }: { limit?: number | 'all' } = {}) => {
  const apiKey = getApiKey()
  const url = buildGhostUrl('ghost/api/content/posts/')

  if (!apiKey || !url) {
    console.warn('Ghost API env vars missing: GHOST_API_URL / GHOST_CONTENT_API_KEY')
    return [] as GhostPostFull[]
  }

  url.searchParams.set('key', apiKey)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('order', 'published_at desc')
  url.searchParams.set('include', 'tags,authors')

  try {
    const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
    if (!response.ok) {
      console.warn(`Ghost API error: ${response.status}`)
      return [] as GhostPostFull[]
    }

    const data = (await response.json()) as { posts?: GhostPostResponse[] }
    return (data.posts ?? []).map((post): GhostPostFull => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      date: formatDate(post.published_at),
      dateISO: post.published_at,
      href: `/blog/${post.slug}`,
      image: post.feature_image ?? null,
      html: post.html ?? '',
      readingTime: post.reading_time ?? 0,
      tag: post.primary_tag?.name ?? post.tags?.[0]?.name ?? 'Uncategorized',
      tags: (post.tags ?? []).map((t) => t.name),
      author: {
        name: post.primary_author?.name ?? post.authors?.[0]?.name ?? 'Amalfi.Day',
        image: post.primary_author?.profile_image ?? post.authors?.[0]?.profile_image ?? null,
        bio: post.primary_author?.bio ?? post.authors?.[0]?.bio ?? null,
      },
    }))
  } catch (error) {
    console.warn('Ghost API fetch failed', error)
    return [] as GhostPostFull[]
  }
}
