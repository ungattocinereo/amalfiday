export const site = {
  name: 'Amalfi.Day',
  description: 'Epic photoshoots on the Amalfi Coast. Story-driven sessions with golden light and cinematic locations.',
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
  phone: '+39 339 2768989',
  email: 'hello@amalfi.day',
  geo: { lat: 40.6394, lon: 14.6064 },
  bookingUrl: 'https://www.booking.com/hotel/it/cristallpont-amalfi-day.html',
  airbnbUrl: 'https://www.airbnb.com/p/atrani',
  instagramUrl: 'https://instagram.com/amalfi.day',
  facebookUrl: 'https://facebook.com/amalfi.day',
  twitterUrl: 'https://twitter.com/amalfiday',
}

type NavigationDropdownItem = {
  label: string
  href: string
  icon: string
}

type NavigationDropdownSection = {
  heading: string
  items: NavigationDropdownItem[]
}

type NavigationItem = {
  label: string
  href?: string
  icon: string
  dropdownSections?: NavigationDropdownSection[]
}

export const navigation: NavigationItem[] = [
  { label: 'News', href: '/blog', icon: 'fa-newspaper' },
  {
    label: 'Experience',
    href: '/experience',
    icon: 'fa-star',
    dropdownSections: [
      {
        heading: 'Capture Your Story',
        items: [
          { label: 'Individual Photo Shooting', href: '/photoshootings', icon: 'fa-person' },
          { label: 'Couple Photo Shooting', href: '/photoshootings#couples', icon: 'fa-users' },
        ],
      },
      {
        heading: 'Tours',
        items: [
          { label: 'Scenic Coast', href: '/experience/car-tours#tour-scenic', icon: 'fa-location-dot' },
          { label: 'Peak Flavors', href: '/experience/car-tours#tour-tramonti', icon: 'fa-tree' },
          { label: 'Scooter Photo Tour', href: '/experience/scooter', icon: 'fa-gauge-high' },
        ],
      },
    ],
  },
  {
    label: 'Coast Intel',
    icon: 'fa-compass',
    dropdownSections: [
      {
        heading: 'Stay',
        items: [
          { label: 'Apartments', href: '/apartments', icon: 'fa-house' },
        ],
      },
      {
        heading: 'Transport',
        items: [
          { label: 'How to get here', href: '/how-to-get', icon: 'fa-route' },
          { label: 'Ferry timetables', href: '/ferry-timetables', icon: 'fa-ship' },
          { label: 'Bus & public transport', href: '/timetables', icon: 'fa-bus' },
          { label: 'Parking tips', href: '/parking', icon: 'fa-square-parking' },
        ],
      },
      {
        heading: 'Field Notes',
        items: [
          { label: 'Photo spots', href: '/photolocations', icon: 'fa-map-location-dot' },
          { label: 'Beach reviews', href: '/beaches', icon: 'fa-umbrella-beach' },
          { label: 'Moto roads', href: '/moto', icon: 'fa-motorcycle' },
        ],
      },
    ],
  },
]

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
    href: '/photoshootings/shifa',
    image: '/photoshootings/individual/Shifa/Hero.webp',
  },
  {
    title: 'The Perfect Gift to Yourself',
    location: 'Ravello',
    href: '/photoshootings/loreana',
    image: '/photoshootings/individual/Loreana/HERO-Loreana-photoshooting-in-amalfi-ravello-september-2025-38.webp',
  },
  {
    title: 'Morning Glow. True Atrani.',
    location: 'Atrani',
    href: '/photoshootings/lashada',
    image: '/photoshootings/individual/Lashada/HERO-Lashanda_Brown-August-2025_2.webp',
  },
  {
    title: 'Ravello Light Elegance',
    location: 'Ravello',
    href: '/photoshootings/ravello-photoshooting',
    image: '/photoshootings/ravello-photoshooting/hero-Photoshooting-ravello-top-page-001.webp',
  },
  {
    title: 'Ravello Romance (Taylor & Regan)',
    location: 'Ravello',
    href: '/photoshootings/regan-tay-ravello',
    image: '/photoshootings/regan-tay-ravello/HERO-regan-walk-ravello-love.webp',
  },
  {
    title: 'Symphony of Love',
    location: 'Atrani',
    href: '/photoshootings/olga-marat',
    image: '/photoshootings/olga-marat/28-olga-marat-atrani-2023.webp',
  },
  {
    title: "Ayuna's Photographic Memoir",
    location: 'Atrani',
    href: '/photoshootings/ayuna',
    image: '/photoshootings/ayuna/39-Ayuna-Atrani-2023.webp',
  },
  {
    title: 'Camelia: Beautiful Experience',
    location: 'Tramonti',
    href: '/photoshootings/camelia',
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

export const footerLinks = {
  transport: [
    { label: 'Ferry timetables', href: '/ferry-timetables' },
    { label: 'Bus timetables', href: 'https://cnr.pw/bus', external: true },
    { label: 'Book Airport Shuttle', href: 'https://shuttlebus.pintourbus.com', external: true },
    { label: 'Naples to Amalfi', href: '/how-to-get' },
    { label: 'All public transport', href: '/timetables' },
  ],
  apartments: [
    { label: "Greg's guide", href: site.guideUrl, external: true },
    { label: 'Apartment overview', href: '/apartments' },
    {
      label: 'Booking.com',
      href: 'https://www.booking.com/hotel/it/cristallpont-amalfi-day.html',
      external: true,
    },
    { label: 'AirBnb.com', href: 'https://airbnb.com/p/atrani', external: true },
  ],
  info: [
    { label: 'What to do', href: '/experience' },
    { label: 'Photo spots', href: '/photolocations' },
    { label: 'Parking tips', href: '/parking' },
    { label: 'Beach reviews', href: '/beaches' },
    { label: 'Moto roads', href: '/moto' },
  ],
  blog: [
    { label: 'Amalfi News', href: '/blog' },
    { label: 'Contact us', href: '/contact' },
  ],
}

export const heroLinks = {
  ferryPdf: 'https://cnr.pw/ferry',
  busPdf: 'https://cnr.pw/bus',
  apartments: '/apartments',
}

export const etsyUrl = 'https://www.etsy.com'
