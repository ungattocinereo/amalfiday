import { DIRECT_UNIT_IDS, getDirectUnit } from './direct-units.mjs'

export type ApartmentIcal = {
  airbnb?: string[]
  booking?: string[]
}

export type ApartmentBookingLinks = {
  airbnb?: string
  booking?: string
}

export type ApartmentFact = { label: string; value: string }

export type Apartment = {
  id: string
  name: string
  // Detail page /apartments/<id>/ — every value below restates copy already on the site.
  town: 'Atrani' | 'Ravello'
  kind: 'apartment' | 'suite' | 'room'
  typeLabel: string
  summary: string
  seoDescription: string
  facts?: ApartmentFact[]
  bedrooms?: number
  calendar: string
  cin?: string
  description: string
  gallery: string[]
  galleryStyle?: 'scroll' | 'cycle'
  bookingLinks: ApartmentBookingLinks
  ical: ApartmentIcal
  direct?: { maxGuests: number }
}

export type ApartmentSection = {
  id: string
  title: string
  subtitle?: string
  layout: 'featured' | 'grid-2'
  items: Apartment[]
}

const GENERIC_BOOKING_URL =
  'https://www.booking.com/hotel/it/cristallpont-amalfi-day.html'

const RAW_APARTMENT_SECTIONS: ApartmentSection[] = [
  {
    id: 'stays',
    title: 'Timeless Retreat in Ravello',
    subtitle: 'Historical 2-bedroom apartment',
    layout: 'featured',
    items: [
      {
        id: 'villa-susy',
        name: 'Villa Susy',
        town: 'Ravello',
        kind: 'apartment',
        typeLabel: 'Historical two-bedroom apartment',
        summary:
          'Villa Susy is our timeless retreat in Ravello: a historical two-bedroom apartment, just a mile from Amalfi.',
        seoDescription:
          'Villa Susy: a historical two-bedroom apartment in Ravello, a mile from Amalfi, run by CristallPont Amalfi Day. Photos, CIN and Booking.com link.',
        bedrooms: 2,
        calendar: 'Villa Susy',
        cin: 'IT065104C2Q9GJBER7',
        description:
          "This villa, located just a mile from Amalfi, offers a unique blend of authenticity and comfort. As you step inside, you'll be transported to a world where the past comes alive, and the present moment is savored.",
        gallery: [
          '/apartments/villa-ravello-amalfiday-rent-1500x770.webp',
          '/apartments/villa-ravello-amalfiday-rent-2-1500x770.webp',
        ],
        galleryStyle: 'scroll',
        bookingLinks: {
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          booking: [
            'https://ical.booking.com/v1/export?t=d3c249ba-4358-4d99-abfd-7b81980525bf',
          ],
        },
      },
    ],
  },
  {
    id: 'suites',
    title: 'Suites by the sea',
    subtitle: 'Apartment options that keep you close to the beach and the Atrani rhythm.',
    layout: 'grid-2',
    items: [
      {
        id: 'awesome',
        name: 'Awesome apartments',
        town: 'Atrani',
        kind: 'apartment',
        typeLabel: 'Apartment by the sea',
        summary:
          'Awesome apartments is an apartment just above the centre of Atrani, with a separate kitchen, a shower room and a spacious room.',
        seoDescription:
          'Awesome apartments in Atrani: separate kitchen, shower room and a spacious room above the centre, up to 2 guests. Book direct or on Airbnb.',
        facts: [
          { label: 'Access', value: '350 steps uphill, a 5–7 minute walk' },
          { label: 'Kitchen', value: 'Separate kitchen' },
          { label: 'Bathroom', value: 'Shower room' },
        ],
        calendar: 'Awesome Apts',
        cin: 'IT065011B442X3QQQL',
        description:
          'Our location is just above the city center, a 5-7 minute walk uphill via 350 steps. The apartment features a separate kitchen, shower room, and a spacious room.',
        gallery: ['/apartments/awesomeapts.jpg.avif'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/3456236',
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/3456236.ics?t=eb37cdcccf9a4865b675311c819e0fd2',
          ],
        },
      },
      {
        id: 'sunrise-balcony',
        name: 'The Sunrise Balcony',
        town: 'Ravello',
        kind: 'apartment',
        typeLabel: 'Apartment with kitchen and balcony',
        summary:
          'The Sunrise Balcony is a spacious apartment in Ravello with a kitchen and a balcony facing the sunrise over Amalfi.',
        seoDescription:
          'The Sunrise Balcony: a spacious apartment in Ravello with a kitchen and a balcony facing the sunrise over Amalfi. Photos, CIN, availability, Airbnb.',
        facts: [
          { label: 'Kitchen', value: 'Yes' },
          { label: 'Outdoor', value: 'Balcony facing the sunrise' },
        ],
        calendar: 'The Sunrise Balcony',
        cin: 'IT065104C24IZCCRHA',
        description:
          'A spacious apartment in Ravello with a kitchen and a balcony facing the sunrise over Amalfi. A bright, comfortable base for slow mornings above the coast.',
        gallery: ['/apartments/the-sunrise-balcony.webp'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/1681964318010929888',
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/1681964318010929888.ics?t=e62e556b493b43a0810805f46513a918',
          ],
        },
      },
      {
        id: 'carina',
        name: 'Suite Carina',
        town: 'Atrani',
        kind: 'suite',
        typeLabel: 'Double-level apartment',
        summary:
          'Suite Carina is a double-level apartment in the heart of Atrani, with no steps to reach it and windows on Atrani\'s main street.',
        seoDescription:
          'Suite Carina: a double-level apartment in the heart of Atrani, no steps to reach it, windows on the main street. Book on Airbnb or Booking.com.',
        facts: [
          { label: 'Access', value: 'No steps' },
          { label: 'Layout', value: 'Two levels' },
          { label: 'Views', value: 'Atrani\'s main street' },
        ],
        calendar: 'Casa Carina',
        cin: 'IT065011B4MVEU3B33',
        description:
          'This is a double-level apartment located in the heart of the city. There are no steps to access the apartment. The windows offer views of the main street in Atrani.',
        gallery: ['/apartments/casa-carina.jpeg.avif'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/20551225',
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/20551225.ics?t=d02159c760e14554aa6b68ff6c99baf6',
          ],
        },
      },
      {
        id: 'harmony',
        name: 'Suite Harmony',
        town: 'Atrani',
        kind: 'suite',
        typeLabel: 'Apartment with balcony',
        summary:
          'Suite Harmony is a newly decorated apartment in the very centre of Atrani, close to the main street, with a small balcony and mountain views.',
        seoDescription:
          'Suite Harmony: a newly decorated apartment in the very centre of Atrani with a small balcony and mountain views. Photos, CIN, availability, booking.',
        facts: [
          { label: 'Outdoor', value: 'Small balcony' },
          { label: 'Views', value: 'Mountains' },
        ],
        calendar: 'Harmony Suite',
        cin: 'IT065011B4JERC6CIZ',
        description:
          'This newly decorated apartment is located in the very center of Atrani, close to the main street. It features a small balcony with a beautiful mountain-views.',
        gallery: ['/apartments/harmony.jpg.avif'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/37988248',
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/37988248.ics?t=522d3bd9a171444ca1f131daf4c21443',
          ],
        },
      },
      {
        id: 'royal',
        name: 'Royal Suite',
        town: 'Atrani',
        kind: 'suite',
        typeLabel: 'Premium suite',
        summary:
          'Royal Suite is our premium suite in Atrani: thoughtfully decorated, centrally located and a comfortable base for exploring the Amalfi Coast.',
        seoDescription:
          'Royal Suite: our premium, centrally located suite in Atrani on the Amalfi Coast, run by CristallPont Amalfi Day. Photos, availability and booking.',
        calendar: 'Royal Suite',
        description:
          'Our premium suite in Atrani — thoughtfully decorated, centrally located, and a comfortable base for exploring the Amalfi Coast.',
        gallery: ['/apartments/royal.jpeg.avif'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/973032288955949308',
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/973032288955949308.ics?t=06b2618b55984543b0d88662b90ccffd',
          ],
        },
      },
    ],
  },
  {
    id: 'rooms',
    title: 'Rooms in our townhouse',
    subtitle: 'Design-led rooms with balconies and vintage details in the heart of Atrani.',
    layout: 'grid-2',
    items: [
      {
        id: 'vintage',
        name: 'Vintage interior',
        town: 'Atrani',
        kind: 'room',
        typeLabel: 'Double room with balcony',
        summary:
          'Vintage interior is a double room with a balcony in our townhouse in the heart of Atrani, furnished with a vintage aesthetic and a large mirrored closet.',
        seoDescription:
          'Vintage interior: a double room with balcony and mirrored closet in our townhouse in Atrani, up to 2 guests. Book direct, or on Airbnb or Booking.com.',
        facts: [
          { label: 'Outdoor', value: 'Balcony' },
          { label: 'Storage', value: 'Large mirrored closet' },
        ],
        calendar: 'Vintage Room',
        cin: 'IT065011B442X3QQQL',
        description:
          'The room is designed with a vintage aesthetic in mind, featuring decor and furnishings that evoke a sense of nostalgia and timeless elegance. It comes equipped with a large mirrored closet and a balcony where guests can enjoy fresh air and a quiet view.',
        gallery: ['/apartments/room-in-atrani-vintage.webp'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/1491803199632820467',
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/1491803199632820467.ics?t=c7afc2b8c66841ddb0a4a34de5861fb0',
          ],
          booking: [
            'https://ical.booking.com/v1/export/t/ea3e0ad0-f516-43af-a678-dd860ca9e8df.ics',
          ],
        },
      },
      {
        id: 'orange',
        name: 'Orange room',
        town: 'Atrani',
        kind: 'room',
        typeLabel: 'Double room with balcony',
        summary:
          'Orange room is a double room with a balcony in our townhouse in the heart of Atrani, with 1960s decor, a large multi-panel closet and a small table with garden chairs.',
        seoDescription:
          'Orange room: a 1960s-style double room with balcony in our townhouse in Atrani, up to 2 guests. Book direct, or on Airbnb or Booking.com.',
        facts: [
          { label: 'Outdoor', value: 'Balcony' },
          { label: 'Seating', value: 'Garden chairs, small table' },
          { label: 'Storage', value: 'Large multi-panel closet' },
        ],
        calendar: 'Orange Room',
        cin: 'IT065011B442X3QQQL',
        description:
          'This room evokes the nostalgia of the 1960s with its decor and furnishings. It features a large multi-panel closet, a couple of garden chairs with a small table, and a balcony where guests can enjoy fresh air and a view.',
        gallery: ['/apartments/orange-room.jpg'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/1622640206186838346',
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/1622640206186838346.ics?t=717921b0057141649a080db157013617',
          ],
          booking: [
            'https://ical.booking.com/v1/export/t/acb8b56c-0940-4aeb-ab6d-3de433afab7f.ics',
          ],
        },
      },
      {
        id: 'solo',
        name: 'Room for solo traveller',
        town: 'Atrani',
        kind: 'room',
        typeLabel: 'Single room with balcony',
        summary:
          'Room for solo traveller is a compact single room in our townhouse in the heart of Atrani, with a spacious balcony over the main street and mountain views.',
        seoDescription:
          'Room for solo traveller: a single room with a spacious balcony over Atrani\'s main street, for 1 guest. Book direct, or on Airbnb or Booking.com.',
        facts: [
          { label: 'Bed', value: 'Single bed' },
          { label: 'Outdoor', value: 'Spacious balcony' },
          { label: 'Views', value: 'Main street and mountains' },
        ],
        calendar: 'Solo Room',
        cin: 'IT065011B442X3QQQL',
        description:
          'A cozy, compact room with a single bed and a spacious balcony facing the main street of Atrani. The balcony offers mountain views and is perfect for a morning coffee or a nightcap.',
        gallery: ['/apartments/romfor-1-person.jpg.webp'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/1623848144637841636',
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/1623848144637841636.ics?t=59d5a4dd90cb45da90493feafb555e39',
          ],
          booking: [
            'https://ical.booking.com/v1/export/t/5299de87-de9b-499a-a1a2-311fe09f6774.ics',
          ],
        },
      },
      {
        id: 'youth',
        name: 'Room for youngsters',
        town: 'Atrani',
        kind: 'room',
        typeLabel: 'Twin room with bunk beds',
        summary:
          'Room for youngsters is the budget-friendly room in our townhouse in the heart of Atrani: a bunk bed, a big artistic mural and a large window onto an inner street.',
        seoDescription:
          'Room for youngsters: a budget bunk-bed room with a big mural in our townhouse in Atrani, up to 2 guests. Book direct, or on Airbnb or Booking.com.',
        facts: [
          { label: 'Bed', value: 'Bunk bed' },
          { label: 'Window', value: 'Large, onto an inner street' },
        ],
        calendar: 'Bunkbed Room',
        cin: 'IT065011B442X3QQQL',
        description:
          'Functional and budget-friendly — a bunk bed room with a big artistic mural on the wall and a large window that opens onto an inner street. A comfortable base after a long day of exploring.',
        gallery: ['/apartments/casa-bunkbed-room.jpg'],
        bookingLinks: {
          airbnb: 'https://www.airbnb.com/rooms/1624089061068359230',
          booking: GENERIC_BOOKING_URL,
        },
        ical: {
          airbnb: [
            'https://www.airbnb.com/calendar/ical/1624089061068359230.ics?t=7cbf451bfed643a5a403dd2d9489df63',
          ],
          booking: [
            'https://ical.booking.com/v1/export/t/940e8ee6-25a3-4966-9eab-c83b54827e78.ics',
          ],
        },
      },
    ],
  },
]

// Pure: returns a new item carrying `direct` when its id is in the registry.
function withDirect(item: Apartment): Apartment {
  const unit = getDirectUnit(item.id)
  return unit ? { ...item, direct: { maxGuests: unit.maxGuests } } : item
}

export const APARTMENT_SECTIONS: ApartmentSection[] = RAW_APARTMENT_SECTIONS.map((section) => ({
  ...section,
  items: section.items.map(withDirect),
}))

export const ALL_APARTMENTS: Apartment[] = APARTMENT_SECTIONS.flatMap((s) => s.items)

const apartmentById = new Map(ALL_APARTMENTS.map((a) => [a.id, a]))

// Units bookable directly, in registry order. Fails loudly on a registry id with no apartment.
export const DIRECT_APARTMENTS: Apartment[] = DIRECT_UNIT_IDS.map((id) => {
  const apartment = apartmentById.get(id)
  if (!apartment) {
    throw new Error(`Direct unit "${id}" has no matching apartment in APARTMENT_SECTIONS`)
  }
  return apartment
})

// Everything else, booked through the platforms (Airbnb / Booking.com).
export const PLATFORM_APARTMENTS: Apartment[] = ALL_APARTMENTS.filter(
  (a) => !getDirectUnit(a.id)
)

export const ICAL_REGISTRY: Record<string, string[]> = Object.fromEntries(
  ALL_APARTMENTS.map((a) => [
    a.calendar,
    [...(a.ical.airbnb || []), ...(a.ical.booking || [])],
  ])
)

// Detail page of one unit (src/pages/apartments/[id].astro).
export const apartmentPath = (id: string): string => `/apartments/${id}/`
