export type ApartmentIcal = {
  airbnb?: string[]
  booking?: string[]
}

export type ApartmentBookingLinks = {
  airbnb?: string
  booking?: string
}

export type Apartment = {
  id: string
  name: string
  calendar: string
  cin?: string
  description: string
  gallery: string[]
  galleryStyle?: 'scroll' | 'cycle'
  bookingLinks: ApartmentBookingLinks
  ical: ApartmentIcal
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

export const APARTMENT_SECTIONS: ApartmentSection[] = [
  {
    id: 'stays',
    title: 'Timeless Retreat in Ravello',
    subtitle: 'Historical 2-bedroom apartment',
    layout: 'featured',
    items: [
      {
        id: 'villa-susy',
        name: 'Villa Susy',
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
            'https://ical.booking.com/v1/export?t=d1d7f32f-23b9-4914-b348-07719a6bd239',
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
        id: 'carina',
        name: 'Suite Carina',
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

export const ALL_APARTMENTS: Apartment[] = APARTMENT_SECTIONS.flatMap((s) => s.items)

export const ICAL_REGISTRY: Record<string, string[]> = Object.fromEntries(
  ALL_APARTMENTS.map((a) => [
    a.calendar,
    [...(a.ical.airbnb || []), ...(a.ical.booking || [])],
  ])
)

export const AVAILABILITY_END_DATE = { year: 2026, month: 9, day: 31 }
