import { DIRECT_UNITS } from './direct-units.mjs'

export const site = {
  name: 'Amalfi.Day',
  description: 'Amalfi Coast photoshoots, private tours and Atrani apartments, plus local guides to ferries, buses, beaches and parking from a photographer living on the coast.',
  guideUrl: 'https://guide.amalfi.day',
  url: 'https://amalfi.day',
  defaultImage: '/pre-footer/boat-tours-in-amalfi.webp',
  twitterHandle: '@amalfiday',
}

export const business = {
  legalName: 'CristallPont S.R.L.',
  brandName: 'Amalfi.Day',
  vatId: '05863730650',
  street: 'Traversa Dragone, 2',
  locality: 'Atrani',
  region: 'SA',
  postalCode: '84010',
  country: 'IT',
  countryName: 'Italy',
  phone: '+39 327 0972329',
  email: 'hello@amalfi.day',
  geo: { lat: 40.6394, lon: 14.6064 },
  bookingUrl: 'https://www.booking.com/hotel/it/cristallpont-amalfi-day.html',
  airbnbUrl: 'https://www.airbnb.com/p/atrani',
  instagramUrl: 'https://instagram.com/amalfi.day',
  facebookUrl: 'https://facebook.com/amalfi.day',
  twitterUrl: 'https://twitter.com/amalfiday',
  // Towns the photoshoots, tours and guide pages cover (used in structured data).
  areaServed: [
    'Atrani',
    'Amalfi',
    'Ravello',
    'Positano',
    'Praiano',
    'Maiori',
    'Minori',
    'Conca dei Marini',
    'Sorrento',
  ],
  knowsAbout: [
    'Amalfi Coast photoshoots',
    'Couple and family photography',
    'Private Amalfi Coast car tours',
    'Scooter photo tours',
    'Amalfi Coast ferries and buses',
    'Amalfi Coast beaches',
    'Parking on the Amalfi Coast',
    'Holiday apartments in Atrani',
  ],
}

// --- Navigation (one source for the desktop menu, the mobile menu and the footer) ---
//
// Image paths point at the source photos under public/. Each one lives in a single
// `image` field so it can later be swapped for the light menu versions
// (public/nav/<slug>-thumb.webp 120px, public/nav/<slug>-card.webp 560px).

/** Large photo card that opens a panel. */
export type NavFeatured = {
  kind: 'featured'
  href: string
  image: string
  eyebrow: string
  title: string
  /** Italic accent words after the title, e.g. "in frames". */
  titleAccent?: string
  cta: string
  ctaIcon: string
  /** Round "Book direct −10%" sticker on the photo. */
  sticker?: { label: string; value: string }
  tall?: boolean
}

/** A link with a thumbnail photo or an icon tile, a title and a short note. */
export type NavRow = { label: string; href: string; note: string; image?: string; icon?: string }

export type NavRows = {
  kind: 'rows'
  heading: string
  items: NavRow[]
  more?: { label: string; href: string }
}

export type NavLinks = {
  kind: 'links'
  heading: string
  items: { label: string; href: string }[]
  note?: { label: string; href: string; icon: string }
}

export type NavCard = { eyebrow: string; title: string; text: string; href: string; image: string }

export type NavCards = {
  kind: 'cards'
  items: NavCard[]
  more?: { label: string; href: string }
}

/** Small photo strip with one line of text. */
export type NavMini = { kind: 'mini'; href: string; image: string; label: string; icon: string }

export type NavBlock = NavFeatured | NavRows | NavLinks | NavCards | NavMini

export type NavPanel = {
  id: string
  /** Grid recipe of the desktop panel. */
  layout: 'photo' | 'stay' | 'tours' | 'guide'
  blocks: NavBlock[]
}

export type NavigationItem = {
  label: string
  /** Hub page: the link without JS, and the "see all" target on mobile. */
  href: string
  icon: string
  /** Orange pill next to the label (white text). */
  badge?: string
  panel?: NavPanel
}

const navImages = {
  couple: '/photoshootings/optimized/regan-tay-ravello/HERO-regan-walk-ravello-love-720.webp',
  solo: '/photoshootings/optimized/loreana/hero-720.webp',
  family: '/photoshootings/olga-marat/28-olga-marat-atrani-2023.webp',
  balcony: '/apartments/the-sunrise-balcony.webp',
  scenic: '/staticpages/car-tours/Scenic-Coast/Scenic-Coast-amalfi-coast-tours-5.webp',
  peak: '/staticpages/car-tours/Peak-Flavors/Peak-Flavors-amalfi-coast-tours-7.webp',
  moto: '/staticpages/moto/hero/moto-ride-with-photographer-in-amalfi-coast-4.webp',
  ferry: '/staticpages/timetables/ferry-hero-01.webp',
}

// Menu order, short labels and photos of the units that take direct bookings.
// Ids, guest limits and default labels come from the registry.
const directUnitMenu: { id: string; image: string; label?: string }[] = [
  { id: 'orange', image: '/apartments/orange-room.jpg' },
  { id: 'vintage', image: '/apartments/room-in-atrani-vintage.webp' },
  { id: 'awesome', image: '/apartments/3-view-from-cristall-Pont.jpg' },
  { id: 'youth', image: '/apartments/casa-bunkbed-room.jpg' },
  { id: 'solo', image: '/apartments/romfor-1-person.jpg.webp', label: 'Solo traveller' },
]

export const guestsNote = (maxGuests: number) => (maxGuests === 1 ? '1 guest' : `Up to ${maxGuests} guests`)

export const directUnitRows: NavRow[] = directUnitMenu.map(({ id, image, label }) => {
  const unit = DIRECT_UNITS[id as keyof typeof DIRECT_UNITS]
  if (!unit) throw new Error(`Unknown direct unit in the menu: ${id}`)
  return { label: label ?? unit.label, href: `/book/${id}/`, note: guestsNote(unit.maxGuests), image }
})

export const navigation: NavigationItem[] = [
  {
    label: 'Photoshoots',
    href: '/photoshootings/',
    icon: 'ph-camera',
    panel: {
      id: 'nav-photo',
      layout: 'photo',
      blocks: [
        {
          kind: 'featured',
          href: '/photoshootings/',
          image: navImages.couple,
          eyebrow: 'Real stories · Ravello',
          title: 'Your Amalfi,',
          titleAccent: 'in frames',
          cta: 'See all photoshoots',
          ctaIcon: 'ph-arrow-right',
        },
        {
          kind: 'rows',
          heading: 'Who’s in the frame',
          items: [
            { label: 'Solo portrait', note: 'Golden hour, just you', href: '/photoshootings/solo-photoshoot/', image: navImages.solo },
            { label: 'Couples', note: 'Walks, terraces, sunsets', href: '/photoshootings/couple-photoshoot/', image: navImages.couple },
            { label: 'Family', note: 'Relaxed, kids welcome', href: '/photoshootings/family-photoshoot/', image: navImages.family },
            { label: 'Proposal', note: 'We keep the secret', href: '/photoshootings/proposal-photographer/', icon: 'ph-diamond' },
          ],
        },
        {
          kind: 'links',
          heading: 'By location',
          items: [
            { label: 'Positano', href: '/photoshootings/positano-photographer/' },
            { label: 'Amalfi & Atrani', href: '/photoshootings/amalfi-photographer/' },
            { label: 'Ravello', href: '/photoshootings/ravello-photographer/' },
            { label: 'Path of the Gods', href: '/photoshootings/path-of-the-gods-photographer/' },
          ],
          note: { label: 'Never posed? Free posing guide', href: '/#posing-guide', icon: 'ph-sparkle' },
        },
      ],
    },
  },
  {
    label: 'Apartments',
    href: '/apartments/',
    icon: 'ph-house',
    badge: '−10%',
    panel: {
      id: 'nav-stay',
      layout: 'stay',
      blocks: [
        {
          kind: 'featured',
          href: '/apartments/#direct',
          image: navImages.balcony,
          eyebrow: 'Atrani · steps from the sea',
          title: 'Stay with',
          titleAccent: 'locals',
          cta: 'Check your dates',
          ctaIcon: 'ph-calendar-blank',
          sticker: { label: 'Book direct', value: '−10%' },
          tall: true,
        },
        {
          kind: 'rows',
          heading: 'Rooms you can book direct',
          items: directUnitRows,
          more: { label: 'All stays & villas', href: '/apartments/' },
        },
      ],
    },
  },
  {
    label: 'Tours',
    href: '/experience/',
    icon: 'ph-compass',
    panel: {
      id: 'nav-tours',
      layout: 'tours',
      blocks: [
        {
          kind: 'cards',
          items: [
            { eyebrow: 'Private car tour', title: 'Scenic Coast', text: 'Cliff villages, limoncello, lunch by the sea', href: '/experience/car-tours/#tour-scenic', image: navImages.scenic },
            { eyebrow: 'Wine & food', title: 'Peak Flavors', text: 'Tramonti vineyards and mountain views', href: '/experience/car-tours/#tour-tramonti', image: navImages.peak },
            { eyebrow: 'Ride + photos', title: 'Scooter Photo Tour', text: 'Cliffside roads, 50+ photos included', href: '/experience/scooter/', image: navImages.moto },
          ],
          more: { label: 'All experiences', href: '/experience/' },
        },
      ],
    },
  },
  {
    label: 'Coast guide',
    href: '/guide/',
    icon: 'ph-map-trifold',
    panel: {
      id: 'nav-guide',
      layout: 'guide',
      blocks: [
        {
          kind: 'rows',
          heading: 'Getting around',
          items: [
            { label: 'How to get here', note: 'From Naples, Rome, Salerno', href: '/how-to-get/', icon: 'ph-airplane-tilt' },
            { label: 'Ferry timetables', note: 'Updated for the season', href: '/ferry-timetables/', icon: 'ph-boat' },
            { label: 'Buses', note: 'SITA lines and stops', href: '/timetables/', icon: 'ph-bus' },
            { label: 'Parking', note: 'Where and how much', href: '/parking/', icon: 'ph-park' },
          ],
        },
        {
          kind: 'links',
          heading: 'Field notes',
          items: [
            { label: 'Beach reviews', href: '/beaches/' },
            { label: 'Moto roads', href: '/moto/' },
            { label: 'What to do', href: '/what-to-do/' },
            { label: 'Greg’s guide', href: '/guide/' },
          ],
        },
        { kind: 'mini', href: '/ferry-timetables/', image: navImages.ferry, label: 'Next ferry from Amalfi', icon: 'ph-arrow-up-right' },
      ],
    },
  },
  { label: 'News', href: '/blog/', icon: 'ph-newspaper' },
]

/** The one filled action in the bar. */
export const navCta = { label: 'Plan your day', href: '/contact/', icon: 'ph-chat-circle-dots' }

/** Every link of a panel as flat sections (used by the mobile menu). */
export const navSections = (item: NavigationItem) =>
  (item.panel?.blocks ?? []).flatMap((block) => {
    switch (block.kind) {
      case 'featured':
        return [{ heading: block.eyebrow, items: [{ label: block.cta, href: block.href, icon: block.ctaIcon }] }]
      case 'rows':
        return [{ heading: block.heading, items: [...block.items.map((row) => ({ label: row.label, href: row.href, icon: row.icon })), ...(block.more ? [{ label: block.more.label, href: block.more.href, icon: 'ph-arrow-right' }] : [])] }]
      case 'links':
        return [{ heading: block.heading, items: [...block.items.map((link) => ({ label: link.label, href: link.href, icon: undefined as string | undefined })), ...(block.note ? [{ label: block.note.label, href: block.note.href, icon: block.note.icon }] : [])] }]
      case 'cards':
        return [{ heading: item.label, items: [...block.items.map((card) => ({ label: card.title, href: card.href, icon: undefined as string | undefined })), ...(block.more ? [{ label: block.more.label, href: block.more.href, icon: 'ph-arrow-right' }] : [])] }]
      case 'mini':
        return []
    }
  })

export const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/amalfi.day' },
  { label: 'Facebook', href: 'https://facebook.com/amalfi.day' },
  { label: 'Twitter', href: 'https://twitter.com/amalfiday' },
  { label: 'Email', href: 'mailto:hello@amalfi.day' },
]

export const featuredPhotoshoots = [
  {
    title: 'Amalfi Influencer Photoshoot',
    location: 'Amalfi',
    href: '/photoshootings/shifa/',
    image: '/photoshootings/individual/Shifa/Hero.webp',
  },
  {
    title: 'The Perfect Gift to Yourself',
    location: 'Ravello',
    href: '/photoshootings/loreana/',
    image: '/photoshootings/individual/Loreana/HERO-Loreana-photoshooting-in-amalfi-ravello-september-2025-38.webp',
  },
  {
    title: 'Morning Glow. True Atrani.',
    location: 'Atrani',
    href: '/photoshootings/lashada/',
    image: '/photoshootings/individual/Lashada/HERO-Lashanda_Brown-August-2025_2.webp',
  },
  {
    title: 'Ravello Light Elegance',
    location: 'Ravello',
    href: '/photoshootings/ravello-photoshooting/',
    image: '/photoshootings/ravello-photoshooting/hero-Photoshooting-ravello-top-page-001.webp',
  },
  {
    title: 'Ravello Romance (Taylor & Regan)',
    location: 'Ravello',
    href: '/photoshootings/regan-tay-ravello/',
    image: '/photoshootings/regan-tay-ravello/HERO-regan-walk-ravello-love.webp',
  },
  {
    title: 'Symphony of Love',
    location: 'Atrani',
    href: '/photoshootings/olga-marat/',
    image: '/photoshootings/olga-marat/28-olga-marat-atrani-2023.webp',
  },
  {
    title: "Ayuna's Photographic Memoir",
    location: 'Atrani',
    href: '/photoshootings/ayuna/',
    image: '/photoshootings/ayuna/39-Ayuna-Atrani-2023.webp',
  },
  {
    title: 'Camelia: Beautiful Experience',
    location: 'Tramonti',
    href: '/photoshootings/camelia/',
    image: '/photoshootings/camelia/4-camelia-photoshooting-moto.webp',
  },
]

export const blogCategories = ['All', 'Fashion', 'Couple', 'Motorbike', 'Car']

export const blogTags = [
  'travel',
  'photography',
  'gear',
  'routes',
  'culture',
  'food',
  'tips',
  'events',
]

export type FooterLink = { label: string; href: string; icon: string; external?: boolean }
export type FooterGroup = { heading: string; links: FooterLink[] }

// Footer columns follow the menu: Photoshoots, Apartments, Tours, Coast guide, then News & contact.
export const footerLinks: FooterGroup[] = [
  {
    heading: 'Photoshoots',
    links: [
      { label: 'All photoshoots', href: '/photoshootings/', icon: 'ph-camera' },
      { label: 'Solo portrait', href: '/photoshootings/solo-photoshoot/', icon: 'ph-user' },
      { label: 'Couples', href: '/photoshootings/couple-photoshoot/', icon: 'ph-heart' },
      { label: 'Family', href: '/photoshootings/family-photoshoot/', icon: 'ph-users-three' },
      { label: 'Proposal', href: '/photoshootings/proposal-photographer/', icon: 'ph-diamond' },
    ],
  },
  {
    heading: 'Apartments',
    links: [
      { label: 'Book direct −10%', href: '/apartments/#direct', icon: 'ph-calendar-check' },
      { label: 'All stays & villas', href: '/apartments/', icon: 'ph-house' },
      { label: 'Booking.com', href: business.bookingUrl, icon: 'ph-bed', external: true },
      { label: 'Airbnb', href: business.airbnbUrl, icon: 'ph-house-line', external: true },
    ],
  },
  {
    heading: 'Tours',
    links: [
      { label: 'Scenic Coast', href: '/experience/car-tours/#tour-scenic', icon: 'ph-map-pin' },
      { label: 'Peak Flavors', href: '/experience/car-tours/#tour-tramonti', icon: 'ph-wine' },
      { label: 'Scooter Photo Tour', href: '/experience/scooter/', icon: 'ph-moped' },
      { label: 'All experiences', href: '/experience/', icon: 'ph-star' },
    ],
  },
  {
    heading: 'Coast guide',
    links: [
      { label: 'How to get here', href: '/how-to-get/', icon: 'ph-path' },
      { label: 'Ferry timetables', href: '/ferry-timetables/', icon: 'ph-boat' },
      { label: 'Buses', href: '/timetables/', icon: 'ph-bus' },
      { label: 'Parking', href: '/parking/', icon: 'ph-park' },
      { label: 'Beach reviews', href: '/beaches/', icon: 'ph-umbrella' },
      { label: 'Moto roads', href: '/moto/', icon: 'ph-motorcycle' },
      { label: 'Airport shuttle', href: 'https://shuttlebus.pintourbus.com', icon: 'ph-ticket', external: true },
    ],
  },
  {
    heading: 'Amalfi.Day',
    links: [
      { label: 'News', href: '/blog/', icon: 'ph-newspaper' },
      { label: 'What to do', href: '/what-to-do/', icon: 'ph-star-four' },
      { label: 'Greg’s guide', href: site.guideUrl, icon: 'ph-signpost', external: true },
      { label: 'Plan your day', href: navCta.href, icon: 'ph-chat-circle-dots' },
    ],
  },
]

export const heroLinks = {
  ferryPdf: 'https://cnr.pw/ferry',
  busPdf: 'https://cnr.pw/bus',
  apartments: '/apartments/',
}

export const etsyUrl = 'https://www.etsy.com'
