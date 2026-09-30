import { site } from './site'

export const photography = {
  url: `${site.url}/photoshootings/`,
  photographerId: `${site.url}/photoshootings/#gregory`,
  serviceId: `${site.url}/photoshootings/#service`,
  poseGuideUrl: 'https://poses.amalfi.day',
  localgrapherUrl: 'https://www.localgrapher.com/profile/gregory/',
  getYourGuideUrl: 'https://www.getyourguide.com/atrani-l128528/amalfi-sunrise-photoshoot-t1013879/',
  airbnbUrl: 'https://www.airbnb.com/services/6930366',
}

export const photographerSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': photography.photographerId,
  name: 'Gregory',
  alternateName: 'Greg',
  jobTitle: 'Amalfi Coast photographer',
  url: photography.photographerId,
  image: `${site.url}/staticpages/gregs-transparency.webp`,
  description: 'Gregory (Greg) is the photographer behind Amalfi.Day, based in Atrani on the Amalfi Coast. He photographs couples and solo travelers, helps with posing throughout the session, and shares a free posing guide at poses.amalfi.day.',
  knowsLanguage: ['English', 'Italian', 'Russian'],
  homeLocation: { '@type': 'Place', name: 'Atrani, Amalfi Coast, Italy' },
  sameAs: [photography.localgrapherUrl],
  subjectOf: [photography.airbnbUrl, photography.getYourGuideUrl].map((url) => ({
    '@type': 'WebPage',
    url,
  })),
}

export type PhotographyPackage = {
  id: string
  session: 'solo' | 'couple'
  tier: 'Mini' | 'Signature' | 'Coastal Story'
  name: string
  price: number
  durationMinutes: number
  photoCount: number
  tagline: string
  locations: string
  route: string
  outfits: string
  previews: number
  idealFor: string
  recommended: boolean
}

// Cards, booking requests, FAQ and structured data share these package details.
export const photographyPackages = {
  portrait: {
    id: 'travelers-portrait',
    session: 'solo',
    tier: 'Mini',
    name: 'Solo Mini',
    price: 200,
    durationMinutes: 30,
    photoCount: 20,
    tagline: 'A little time. A beautiful memory of the coast.',
    locations: 'Atrani or Amalfi',
    route: 'One compact area',
    outfits: 'One outfit',
    previews: 0,
    idealFor: 'A few favorite portraits from your trip',
    recommended: false,
  },
  soloSignature: {
    id: 'solo-signature',
    session: 'solo',
    tier: 'Signature',
    name: 'Solo Signature',
    price: 300,
    durationMinutes: 60,
    photoCount: 60,
    tagline: 'Time to settle in, explore and find your favorite angles.',
    locations: 'Atrani or Amalfi',
    route: '2–3 nearby photo spots',
    outfits: 'Time for one outfit change',
    previews: 3,
    idealFor: 'Travel portraits, birthdays & fresh profile photos',
    recommended: true,
  },
  coastal: {
    id: 'coastal-stories',
    session: 'solo',
    tier: 'Coastal Story',
    name: 'Solo Coastal Story',
    price: 480,
    durationMinutes: 120,
    photoCount: 120,
    tagline: 'Two towns, different looks and a story that feels like you.',
    locations: 'Atrani & Amalfi',
    route: '4–6 photo spots across two towns',
    outfits: 'Time for two outfit changes',
    previews: 5,
    idealFor: 'A full travel story, creators & personal portfolios',
    recommended: false,
  },
  coupleMini: {
    id: 'couple-mini',
    session: 'couple',
    tier: 'Mini',
    name: 'Couple Mini',
    price: 250,
    durationMinutes: 30,
    photoCount: 20,
    tagline: 'A short coastal escape, just for the two of you.',
    locations: 'Atrani or Amalfi',
    route: 'One compact area',
    outfits: 'One outfit each',
    previews: 0,
    idealFor: 'A few favorite moments together',
    recommended: false,
  },
  golden: {
    id: 'golden-hour-atrani',
    session: 'couple',
    tier: 'Signature',
    name: 'Couple Signature',
    price: 350,
    durationMinutes: 60,
    photoCount: 60,
    tagline: '60 unhurried minutes of sea views, quiet streets and you.',
    locations: 'Atrani or Amalfi',
    route: '2–3 nearby photo spots',
    outfits: 'Time for one outfit change',
    previews: 3,
    idealFor: 'Honeymoons, anniversaries & romantic getaways',
    recommended: true,
  },
  panorama: {
    id: 'two-towns-panorama',
    session: 'couple',
    tier: 'Coastal Story',
    name: 'Couple Coastal Story',
    price: 550,
    durationMinutes: 120,
    photoCount: 120,
    tagline: 'Follow the coast together, with room for every little moment.',
    locations: 'Atrani & Amalfi',
    route: '4–6 photo spots across two towns',
    outfits: 'Time for two outfit changes',
    previews: 5,
    idealFor: 'A longer love story & a relaxed two-town experience',
    recommended: false,
  },
} satisfies Record<string, PhotographyPackage>

export const photographyExtraHour = { solo: 180, couple: 200 }

export const describePhotographyPackage = (pkg: PhotographyPackage) =>
  `${pkg.session === 'solo' ? 'Solo' : 'Couple'} photoshoot: ${pkg.durationMinutes} minutes, ${pkg.route.toLowerCase()} in ${pkg.locations}, ${pkg.photoCount}+ retouched photos${pkg.previews ? `, ${pkg.previews} preview photos within 24 hours` : ''}, and private online gallery delivery within 7 business days.`
