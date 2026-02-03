type GhostPostResponse = {
  title: string
  slug: string
  excerpt: string
  published_at: string
  feature_image: string | null
  url: string
}

export type GhostPost = {
  title: string
  excerpt: string
  date: string
  dateISO: string
  href: string
  image: string | null
}

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
  const apiUrl = process.env.GHOST_API_URL
  if (!apiUrl) return null
  const base = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`
  return new URL(path, base)
}

export const getGhostPosts = async ({ limit = 6 }: { limit?: number } = {}) => {
  const apiKey = process.env.GHOST_CONTENT_API_KEY
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
    'title,slug,excerpt,published_at,feature_image,url'
  )

  try {
    const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
    if (!response.ok) {
      console.warn(`Ghost API error: ${response.status}`)
      return [] as GhostPost[]
    }

    const data = (await response.json()) as { posts?: GhostPostResponse[] }
    return (data.posts ?? []).map((post) => ({
      title: post.title,
      excerpt: post.excerpt,
      date: formatDate(post.published_at),
      dateISO: post.published_at,
      href: post.url,
      image: post.feature_image ?? null,
    }))
  } catch (error) {
    console.warn('Ghost API fetch failed', error)
    return [] as GhostPost[]
  }
}
