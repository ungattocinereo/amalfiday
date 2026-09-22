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

// Base package prices are shared by the visible cards and their structured data.
export const photographyPackages = {
  portrait: {
    id: 'travelers-portrait',
    name: "Traveler's Portrait",
    price: 200,
    description: 'Solo photoshoot: approximately 45 minutes, 2 locations in Atrani, 25+ retouched photos, and delivery in 7 business days.',
  },
  coastal: {
    id: 'coastal-stories',
    name: 'Coastal Stories',
    price: 320,
    description: 'Solo or influencer photoshoot: approximately 1.5 hours, 3–4 locations in Atrani and beyond, 50+ retouched photos, and delivery in 7 business days.',
  },
  golden: {
    id: 'golden-hour-atrani',
    name: 'Golden Hour Atrani',
    price: 280,
    description: 'Couple photoshoot: approximately 1 hour, 2–3 locations in Atrani, 40+ retouched photos, and delivery in 7 business days.',
  },
  panorama: {
    id: 'two-towns-panorama',
    name: 'Two Towns Panorama',
    price: 400,
    description: 'Couple photoshoot: approximately 2 hours, 4–6 locations across Atrani and Amalfi, 80+ retouched photos, and delivery in 7 business days.',
  },
}
