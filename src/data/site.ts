export const site = {
  name: 'Amalfi.Day',
  description: 'Epic photoshoots on the Amalfi Coast. Story-driven sessions with golden light and cinematic locations.',
  guideUrl: 'https://guide.amalfi.day',
}

export const navigation = [
  { label: 'News', href: '/blog', icon: 'bi-newspaper' },
  { label: 'Experience', href: '/experience', icon: 'bi-stars' },
  { label: 'Apartments', href: '/apartments', icon: 'bi-house-door' },
]

export const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/amalfi.day' },
  { label: 'Facebook', href: 'https://facebook.com/amalfi.day' },
  { label: 'Twitter', href: 'https://twitter.com/amalfiday' },
  { label: 'Email', href: 'mailto:hello@amalfi.day' },
]

export const featuredPhotoshoots = [
  {
    title: 'Atrani golden session',
    location: 'Atrani, Amalfi Coast',
    href: '/photo/atrani-iana-session',
  },
  {
    title: 'Ravello sunset walk',
    location: 'Ravello',
    href: '/photo/ravello-sunset-walk',
  },
  {
    title: 'Amalfi rooftops',
    location: 'Amalfi',
    href: '/photo/amalfi-rooftops',
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
    { label: 'Ferry timetables', href: 'https://cnr.pw/ferry', external: true },
    { label: 'Bus timetables', href: 'https://cnr.pw/bus', external: true },
    { label: 'Airport shuttle', href: '#airport' },
    { label: "Greg's guide", href: site.guideUrl, external: true },
  ],
  apartments: [
    { label: 'Booking.com', href: 'https://www.booking.com', external: true },
    { label: 'Airbnb', href: 'https://www.airbnb.com', external: true },
    { label: 'Apartments overview', href: '/apartments' },
  ],
  info: [
    { label: 'How to get here', href: '/how-to-get' },
    { label: 'What to do', href: '/what-to-do' },
    { label: 'Parking tips', href: '/parking' },
    { label: 'Beach reviews', href: '/beaches' },
  ],
  blog: [
    { label: 'Latest post in blog', href: '/blog' },
    { label: 'Random blog post', href: '/blog?random=1' },
    { label: 'Add to bookmarks', href: '#bookmark', action: 'bookmark' },
  ],
}

export const heroLinks = {
  ferryPdf: 'https://cnr.pw/ferry',
  busPdf: 'https://cnr.pw/bus',
  apartments: '/apartments',
}

export const etsyUrl = 'https://www.etsy.com'
