export type PhotoSpotMapType =
  | 'Beach'
  | 'Viewpoint'
  | 'Architecture'
  | 'Hidden Gem'
  | 'Hike'
  | 'Sea'

export type PhotoSpotTime = 'Sunrise' | 'Golden Hour' | 'Sunset' | 'Any Time'
export type PhotoSpotDifficulty = 'Easy' | 'Moderate' | 'Hike'

export type PhotoSpotQuote = {
  text: string
  source?: string
}

export type PhotoSpotImage = {
  src: string
  alt: string
  width: number
  height: number
}

export type PhotoSpot = {
  slug: string
  title: string
  city: string
  mapType: PhotoSpotMapType
  types: string[]
  timeTags: PhotoSpotTime[]
  difficulty: PhotoSpotDifficulty
  cost: string
  coordinates: {
    lat: number
    lng: number
  }
  isApproximate?: boolean
  mapsUrl: string
  locationNote?: string
  description: string[]
  quotes: PhotoSpotQuote[]
  bestTime: string
  tips: string[]
  image: PhotoSpotImage
  gallery?: PhotoSpotImage[]
}

export const photoSpotCities = [
  'Positano',
  'Amalfi',
  'Atrani',
  'Ravello',
  'Praiano',
  'Furore',
  'Conca dei Marini',
  'Minori',
  'Maiori',
  'Vietri sul Mare',
  'Sorrento',
  'Capri',
] as const

export const photoSpotMapTypes: PhotoSpotMapType[] = [
  'Beach',
  'Viewpoint',
  'Architecture',
  'Hidden Gem',
  'Hike',
  'Sea',
]

export const photoSpotTimeTags: PhotoSpotTime[] = [
  'Sunrise',
  'Golden Hour',
  'Sunset',
  'Any Time',
]

export const photoSpotDifficulties: PhotoSpotDifficulty[] = ['Easy', 'Moderate', 'Hike']

const searchMaps = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

const fallbackCoastImage: PhotoSpotImage = {
  src: '/staticpages/how-to-get/destination-amalfi-atrani.webp',
  alt: 'Amalfi Coast town and sea view used as a contextual photo spot preview',
  width: 1024,
  height: 1024,
}

export const photoSpots: PhotoSpot[] = [
  {
    slug: 'positano-spiaggia-grande',
    title: 'Spiaggia Grande',
    city: 'Positano',
    mapType: 'Beach',
    types: ['Beach', 'Iconic Viewpoint'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Easy',
    cost: 'Free before the beach clubs open around 8:00',
    coordinates: { lat: 40.627477, lng: 14.488128 },
    mapsUrl: 'https://maps.app.goo.gl/RYVzePMisaL75x1E7',
    description: [
      'The signature Amalfi Coast frame: a sloping beach, turquoise and orange umbrellas, and Positano rising behind it in pastel layers.',
      'It is famous because the composition works from almost every angle. The town gives height, the umbrellas give rhythm, and the water adds a clean foreground.',
    ],
    quotes: [
      { text: 'The most instagrammed spot on the entire coast and definitely worth a picture.', source: 'carinaberry.com' },
      { text: 'Lines of beach umbrellas and the hill of Positano in the background make it one of the best photo spots on the coast.', source: 'exploredbymarta.com' },
      { text: 'Shoot at sunrise for the best lighting and a quiet beach.', source: 'lovehardtraveloften.com' },
    ],
    bestTime: 'Sunrise before 7:30 for empty sand and soft side light. Evening is strong too, when the town lights reflect in the water.',
    tips: [
      'Arrive before the beach club setup if you want the cleanest frame.',
      'For fewer loungers in the shot, move toward the rocky cliffside edge.',
      'Use the stone steps on the left for a small lift above the beach.',
      'Stay after dusk for the moment when Positano lights up all at once.',
    ],
    image: {
      src: '/staticpages/how-to-get/destination-positano.webp',
      alt: 'Positano and Spiaggia Grande on the Amalfi Coast',
      width: 1024,
      height: 1024,
    },
  },
  {
    slug: 'positano-via-cristoforo-colombo',
    title: 'Via Cristoforo Colombo',
    city: 'Positano',
    mapType: 'Viewpoint',
    types: ['Viewpoint', 'Street Photo'],
    timeTags: ['Golden Hour', 'Sunset'],
    difficulty: 'Easy',
    cost: 'Free',
    coordinates: { lat: 40.628, lng: 14.489583 },
    mapsUrl: 'https://maps.app.goo.gl/e5MTxZjpCcQyK4Pz8',
    locationNote: 'The classic angle sits around Via Cristoforo Colombo 44.',
    description: [
      'This upper Positano road gives the classic panoramic view over Spiaggia Grande, the port, and the cliffs behind town.',
      'It is a simple street viewpoint, but the layered vertical city makes it feel cinematic. Keep walking uphill past the busiest corner and the crowd thins quickly.',
    ],
    quotes: [
      { text: 'The classic panoramic view of Positano is one of the most photographed scenes in all of Italy.', source: 'thatonepointofview.com' },
      { text: 'Much of this cliffside street offers some of the best views of Positano.', source: 'exploredbymarta.com' },
      { text: 'Sunset is a magical time to witness here.', source: 'lovehardtraveloften.com' },
    ],
    bestTime: 'Morning for depth and side light, or sunset for pink-orange sky and the first lights of town.',
    tips: [
      'Use a wide lens for the full sweep of Positano.',
      'Walk beyond Franco\'s Bar for quieter angles.',
      'Keep an eye on traffic and avoid standing in the road.',
    ],
    image: {
      src: '/staticpages/car-tours/positano-Hero-tours-amalfi-coast-by-car-3.webp',
      alt: 'High road viewpoint above Positano on the Amalfi Coast',
      width: 1200,
      height: 900,
    },
  },
  {
    slug: 'positano-francos-bar',
    title: "Franco's Bar",
    city: 'Positano',
    mapType: 'Viewpoint',
    types: ['Viewpoint', 'Bar/Rooftop', 'Golden Hour'],
    timeTags: ['Golden Hour', 'Sunset'],
    difficulty: 'Easy',
    cost: 'Drink required, usually around EUR 15-20',
    coordinates: { lat: 40.62842, lng: 14.48898 },
    isApproximate: true,
    mapsUrl: searchMaps("Franco's Bar Positano"),
    locationNote: 'Near Le Sirenuse on Via Cristoforo Colombo.',
    description: [
      'One of Positano\'s most photographed aperitivo terraces, with a clean view over the cliffs, port, and open Mediterranean.',
      'The atmosphere is polished and busy. The photo is worth it, but timing matters more than spontaneity here.',
    ],
    quotes: [
      { text: 'Get in line by 4:45 pm in order to snag a table with a view.', source: 'lovehardtraveloften.com' },
      { text: 'There is a spot in the back right of the bar where you can get a shot next to the glass.', source: 'traveler tip' },
    ],
    bestTime: 'Opening time around 17:30. Arrive around 16:45 in high season if you want a front-row table.',
    tips: [
      'Expect to order a drink if you want to shoot from inside.',
      'If the edge tables are taken, look for the back-right glass corner.',
      'Le Sirenuse is nearby and sometimes allows a brief lobby balcony photo.',
    ],
    image: {
      src: '/photoshootings/couples/katerina-kuznezova-praiano-2021-002.jpg',
      alt: 'Golden hour Amalfi Coast portrait with coastal cliffs',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'positano-via-dei-gladioli-secret-terrace',
    title: 'Secret Terrace on Via dei Gladioli',
    city: 'Positano',
    mapType: 'Hidden Gem',
    types: ['Hidden Gem', 'Viewpoint'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Moderate',
    cost: 'Free',
    coordinates: { lat: 40.63058, lng: 14.48878 },
    isApproximate: true,
    mapsUrl: searchMaps('Via dei Gladioli Positano'),
    locationNote: 'A quiet residential street above Positano; the exact terrace is best found on foot.',
    description: [
      'A calm residential viewpoint above Positano, looking across the whole valley toward the sea.',
      'From this height, the town finally shows its full scale. It feels less like a postcard stop and more like a small local discovery.',
    ],
    quotes: [
      { text: 'A complete surprise and one of my favorite photo spot discoveries of the entire trip.', source: 'thatonepointofview.com' },
      { text: 'Finding it feels like you have stumbled upon a local secret.', source: 'traveler impression' },
      { text: 'A serene spot for taking in the coast in peace.', source: 'traveler impression' },
    ],
    bestTime: 'Morning, when the elevated view catches warm light across the valley.',
    tips: [
      'Bring a wide lens to hold the whole panorama.',
      'The walk is uphill, so keep outfits and shoes practical.',
      'It is quiet enough to slow down and work the frame properly.',
    ],
    image: {
      src: '/staticpages/how-to-get/destination-positano.webp',
      alt: 'Elevated Positano view used as a contextual preview for a residential terrace viewpoint',
      width: 1024,
      height: 1024,
    },
  },
  {
    slug: 'positano-fornillo-beach',
    title: 'Fornillo Beach',
    city: 'Positano',
    mapType: 'Beach',
    types: ['Beach', 'Hidden Gem'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Easy',
    cost: 'Free public beach areas',
    coordinates: { lat: 40.62794, lng: 14.48213 },
    isApproximate: true,
    mapsUrl: searchMaps('Fornillo Beach Positano'),
    locationNote: 'Reached along Via Positanesi d\'America, about 10 minutes from Spiaggia Grande.',
    description: [
      'A quieter beach west of Spiaggia Grande, reached by a scenic path along the water.',
      'The reward is a different Positano angle: the town receding behind pines, benches, stone walls, and a calmer beach rhythm.',
    ],
    quotes: [
      { text: 'One of the most Instagrammable spots on the Amalfi Coast, and a Like winner every time.', source: 'thatanxioustraveller.com' },
      { text: 'After you have taken your shot looking backwards at Positano, just keep walking along the same path.', source: 'traveler tip' },
    ],
    bestTime: 'Morning or late afternoon, when the path and beach are softer and less crowded.',
    tips: [
      'Walk Via Positanesi d\'America from Spiaggia Grande.',
      'Use the pine-side bench as a foreground for a backward view of Positano.',
      'Expect fewer people than on the main beach.',
    ],
    image: {
      src: '/staticpages/how-to-get/destination-positano.webp',
      alt: 'Positano shoreline used as a contextual preview for Fornillo Beach',
      width: 1024,
      height: 1024,
    },
  },
  {
    slug: 'amalfi-duomo-stairs',
    title: 'Duomo di Amalfi Stairs and Arches',
    city: 'Amalfi',
    mapType: 'Architecture',
    types: ['Architecture', 'Iconic'],
    timeTags: ['Sunrise', 'Any Time'],
    difficulty: 'Easy',
    cost: 'Free outside; cathedral interiors are ticketed',
    coordinates: { lat: 40.63404, lng: 14.60268 },
    mapsUrl: 'https://maps.app.goo.gl/e2uPXZ2uaczYR89e6',
    description: [
      'The ninth-century cathedral dominates Piazza del Duomo with striped stone, mosaics, and a dramatic staircase of 62 steps.',
      'The outside gives scale and theatre. The cloister inside adds symmetry, Moorish arches, and a quieter garden mood.',
    ],
    quotes: [
      { text: 'The square in front of the cathedral is probably the most crowded place I have seen on the Amalfi Coast.', source: 'exploredbymarta.com' },
      { text: 'Climbing these stairs is one of the must-do things to do in Amalfi town.', source: 'exploredbymarta.com' },
      { text: 'Arrive in the morning before the masses arrive for the best photos.', source: 'exploredbymarta.com' },
    ],
    bestTime: 'Early morning before 9:00, while the piazza is still breathable.',
    tips: [
      'Shoot upward from the base of the staircase to exaggerate the facade.',
      'From the top, turn around for the whole Piazza Duomo.',
      'Inside, look for symmetry in Chiostro del Paradiso.',
    ],
    image: {
      src: '/photoshootings/couples/couple-photoshooting-amalfi.jpg',
      alt: 'Couple photoshoot in Amalfi near historic architecture',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'amalfi-fishing-pier',
    title: 'Amalfi Fishing Pier',
    city: 'Amalfi',
    mapType: 'Viewpoint',
    types: ['Viewpoint', 'Sea'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Easy',
    cost: 'Free',
    coordinates: { lat: 40.63162, lng: 14.59882 },
    mapsUrl: 'https://maps.app.goo.gl/gWzoZRd1dnFp2sKH6',
    description: [
      'A long stone pier that lets you step out into the sea and look back at Amalfi as a complete postcard.',
      'From the end, the town, port, boats, and mountain stack into one clear composition.',
    ],
    quotes: [
      { text: 'Postcard views of Amalfi town from the sea.', source: 'exploredbymarta.com' },
      { text: 'We came here in the morning before the town was overrun by tourists.', source: 'exploredbymarta.com' },
      { text: 'Time well spent for sure.', source: 'exploredbymarta.com' },
    ],
    bestTime: 'Morning before the port wakes up, or golden hour for warmer texture on the town.',
    tips: [
      'Walk to the end and turn back toward town.',
      'Use boats as foreground, not clutter.',
      'For long exposure, bring a tripod and neutral-density filter.',
    ],
    image: {
      src: '/staticpages/how-to-get/destination-amalfi-atrani.webp',
      alt: 'Amalfi and Atrani coastline from the water side',
      width: 1024,
      height: 1024,
    },
  },
  {
    slug: 'amalfi-cimitero-monumentale-belvedere',
    title: 'Belvedere Cimitero Monumentale',
    city: 'Amalfi',
    mapType: 'Hidden Gem',
    types: ['Hidden Gem', 'Viewpoint'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Moderate',
    cost: 'Free on foot; lift is usually around EUR 1',
    coordinates: { lat: 40.63518, lng: 14.59958 },
    isApproximate: true,
    mapsUrl: searchMaps('Cimitero Monumentale Amalfi'),
    description: [
      'A high, quiet viewpoint at Amalfi\'s historic cemetery, set into the cliff above town.',
      'Most visitors never climb here, which is exactly why the panoramic frame feels so clean: Amalfi, the port, and the curve toward Atrani all open below.',
    ],
    quotes: [
      { text: 'Arguably the best panoramic view of Amalfi and the surrounding coastline.', source: 'thatonepointofview.com' },
      { text: 'A breathtaking, unobstructed view that most tourists miss entirely.', source: 'traveler impression' },
      { text: 'We visited during late afternoon and had this place all to ourselves.', source: 'traveler impression' },
    ],
    bestTime: 'Morning with the sun behind you, or late evening when the place is quiet.',
    tips: [
      'Use this for stitched panoramas or a wide environmental portrait.',
      'You can climb the steep lanes or take the lift when it is running.',
      'Keep the tone respectful: it is still a cemetery.',
    ],
    image: {
      src: '/staticpages/how-to-get/destination-amalfi-atrani.webp',
      alt: 'Amalfi and Atrani coastline used as a preview for the cemetery belvedere',
      width: 1024,
      height: 1024,
    },
  },
  {
    slug: 'atrani-beach',
    title: 'Atrani Beach',
    city: 'Atrani',
    mapType: 'Beach',
    types: ['Beach', 'Iconic', 'Local Vibe'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Easy',
    cost: 'Free public beach areas',
    coordinates: { lat: 40.6365, lng: 14.6088 },
    mapsUrl: 'https://maps.app.goo.gl/7d1H6i2kMS1QMNzG8',
    description: [
      'Italy\'s smallest town has one of the coast\'s most intimate photo scenes: beach, arches, white houses, and cliffs packed into a tiny frame.',
      'Atrani feels calmer than Amalfi, but it photographs with just as much drama because the scale is so compressed.',
    ],
    quotes: [
      { text: 'Atrani is my favorite place on the Amalfi Coast.', source: 'exploredbymarta.com' },
      { text: 'It is nice to escape Amalfi town, walk 10 minutes to Atrani, and find it peaceful but equally beautiful.', source: 'exploredbymarta.com' },
      { text: 'Atrani\'s scale gives intimacy, like stepping into a postcard untouched by time.', source: 'wezoree.com' },
    ],
    bestTime: 'Early morning for an empty beach, or late afternoon when warm light catches the stone walls.',
    tips: [
      'Work three angles: from the sand, from Via Gabriele di Benedetto, and from the small stair balcony above the road.',
      'Step onto the wave breaker for town, beach, and road arch in one frame.',
      'It is calmer than Amalfi, so portraits feel more relaxed.',
    ],
    image: {
      src: '/photoshootings/ayuna/39-Ayuna-Atrani-2023.webp',
      alt: 'Portrait photoshoot in Atrani near the beach and village',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'atrani-san-salvatore-de-birecto',
    title: "Chiesa di San Salvatore de' Birecto",
    city: 'Atrani',
    mapType: 'Architecture',
    types: ['Architecture', 'Hidden Gem'],
    timeTags: ['Any Time'],
    difficulty: 'Easy',
    cost: 'Free',
    coordinates: { lat: 40.63692, lng: 14.60857 },
    mapsUrl: 'https://maps.app.goo.gl/gqFQ3xdgnswhRjiXA',
    description: [
      'A white tenth-century church with a long staircase in the center of Atrani.',
      'It was historically tied to the coronation of Amalfi\'s dukes, and today it offers one of the cleanest architectural portrait frames in town.',
    ],
    quotes: [
      { text: 'A hidden gem not many tourists know about.', source: 'exploredbymarta.com' },
      { text: 'The most significant historical landmark in Atrani.', source: 'exploredbymarta.com' },
      { text: 'Have the photographer stand on the road above and take the perfect shot with the cliffs behind.', source: 'exploredbymarta.com' },
    ],
    bestTime: 'Any time works because the square stays comparatively quiet.',
    tips: [
      'Place the subject on the steps and shoot from the Amalfi Drive road above.',
      'Use the symmetry of the staircase and the white facade.',
      'Keep the background simple: cliffs, steps, facade.',
    ],
    image: {
      src: '/photoshootings/olga-marat/28-olga-marat-atrani-2023.webp',
      alt: 'Atrani photoshoot near village steps and historic streets',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'atrani-stairway-to-heaven',
    title: 'Stairway to Heaven',
    city: 'Atrani',
    mapType: 'Hidden Gem',
    types: ['Hidden Gem', 'Architecture'],
    timeTags: ['Sunrise', 'Any Time'],
    difficulty: 'Moderate',
    cost: 'Free',
    coordinates: { lat: 40.63818, lng: 14.60905 },
    isApproximate: true,
    mapsUrl: searchMaps('Torre dello Ziro Atrani stairs'),
    locationNote: 'Steep stairs rising from Atrani toward Torre dello Ziro.',
    description: [
      'A steep staircase that seems to climb straight out of Atrani and into the sky.',
      'It is one of the most cinematic village frames on the coast: white steps, tiny windows, flowers, and a feeling of vertical movement.',
    ],
    quotes: [
      { text: 'Stairway to Heaven in Atrani.', source: 'exploredbymarta.com' },
      { text: 'Popular with photographers, but few visitors know the exact place.', source: 'local photo note' },
    ],
    bestTime: 'Morning, when the light is soft and the stairs are quieter.',
    tips: [
      'Shoot from below to make the stairs feel endless.',
      'Use blue sky, white steps, and flower pots as the palette.',
      'Wear practical shoes for the climb.',
    ],
    image: {
      src: '/photoshootings/ayuna/14-Ayuna-Atrani-2023.webp',
      alt: 'Atrani stairway portrait on the Amalfi Coast',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'atrani-road-viaduct-view',
    title: 'Road Above Atrani',
    city: 'Atrani',
    mapType: 'Viewpoint',
    types: ['Viewpoint', 'Iconic'],
    timeTags: ['Sunrise', 'Any Time'],
    difficulty: 'Easy',
    cost: 'Free',
    coordinates: { lat: 40.63686, lng: 14.60915 },
    isApproximate: true,
    mapsUrl: searchMaps('Atrani viaduct view Amalfi Drive'),
    locationNote: 'On the coastal road between Amalfi and Atrani, reachable through the pedestrian tunnel.',
    description: [
      'The road above Atrani frames the whole village from above: viaduct, tiny beach, white houses, and cliffs.',
      'The viaduct gives the photograph structure, turning a beautiful town view into a composed architectural frame.',
    ],
    quotes: [
      { text: 'Use the arches of the viaduct to frame your shot of the town and beach below.', source: 'thatonepointofview.com' },
      { text: 'The viaduct framing the beach and white houses makes for a uniquely structured photograph.', source: 'thatonepointofview.com' },
    ],
    bestTime: 'Morning for soft light and fewer people moving through the frame.',
    tips: [
      'Use the viaduct arches as a natural frame.',
      'Stop safely on foot rather than shooting from traffic.',
      'A short telephoto compresses the beach, houses, and cliff beautifully.',
    ],
    image: {
      src: '/staticpages/how-to-get/destination-amalfi-atrani.webp',
      alt: 'Amalfi and Atrani coastline with town and cliff views',
      width: 1024,
      height: 1024,
    },
  },
  {
    slug: 'ravello-villa-cimbrone-terrace-of-infinity',
    title: 'Villa Cimbrone Terrace of Infinity',
    city: 'Ravello',
    mapType: 'Viewpoint',
    types: ['Viewpoint', 'Architecture', 'Garden'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Easy',
    cost: 'Villa gardens ticket, usually around EUR 12',
    coordinates: { lat: 40.64364, lng: 14.61151 },
    mapsUrl: 'https://maps.app.goo.gl/LJv7WWwdF3ZWrfx56',
    description: [
      'The legendary cliff terrace lined with marble busts, opening to a vast sea horizon below Ravello.',
      'Villa Cimbrone adds gardens, cloisters, temples, and historic atmosphere, but the Terrace of Infinity is the frame people cross oceans for.',
    ],
    quotes: [
      { text: 'The ultimate Instagrammable spot on the Amalfi Coast, full of photogenic corners.', source: 'exploredbymarta.com' },
      { text: 'Many regard the terrace as one of the most beautiful places in Italy.', source: 'traveler impression' },
      { text: 'At sunrise or sunset, the horizon dissolves into gold and silver tones.', source: 'wezoree.com' },
    ],
    bestTime: 'Right at opening around 9:00 for the lowest crowd pressure.',
    tips: [
      'Walk directly to the terrace before exploring the rest of the gardens.',
      'Use the marble busts as rhythm along the edge.',
      'Plan one to two hours so you are not rushing the secondary garden frames.',
    ],
    image: {
      src: '/photoshootings/regan-tay-ravello/HERO-regan-walk-ravello-love.webp',
      alt: 'Ravello photoshoot with garden and sea view atmosphere',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'ravello-villa-rufolo',
    title: 'Villa Rufolo',
    city: 'Ravello',
    mapType: 'Viewpoint',
    types: ['Garden', 'Viewpoint', 'Architecture'],
    timeTags: ['Golden Hour', 'Any Time'],
    difficulty: 'Easy',
    cost: 'Villa ticket, usually around EUR 7-8',
    coordinates: { lat: 40.6493, lng: 14.61113 },
    mapsUrl: 'https://maps.app.goo.gl/jZCLfVrymEfxbhCE7',
    description: [
      'A thirteenth-century villa with terraced gardens and one of Italy\'s most recognizable postcard views.',
      'The classic composition looks through pines and towers toward the sea. The contrast between cultivated gardens and rugged coast is the whole magic.',
    ],
    quotes: [
      { text: 'One of the most famous and recognizable postcard views of the Amalfi Coast.', source: 'exploredbymarta.com' },
      { text: 'The contrast between manicured gardens and rugged coastline is what makes photos here special.', source: 'thatonepointofview.com' },
      { text: 'Every corner of these gardens offers a new and stunning composition.', source: 'traveler impression' },
    ],
    bestTime: 'At opening, or during the last two hours before closing for softer light.',
    tips: [
      'Frame the sea through pines, flowers, and stone towers.',
      'Climb Torre Maggiore for a broader Ravello view.',
      'In summer, the music festival can change access and atmosphere.',
    ],
    image: {
      src: '/photoshootings/ravello-photoshooting/hero-Photoshooting-ravello-top-page-001.webp',
      alt: 'Ravello photoshoot with elegant garden light',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'furore-fiordo-di-furore',
    title: 'Fiordo di Furore',
    city: 'Furore',
    mapType: 'Beach',
    types: ['Nature', 'Iconic', 'Beach'],
    timeTags: ['Any Time'],
    difficulty: 'Moderate',
    cost: 'Free',
    coordinates: { lat: 40.61365, lng: 14.55279 },
    mapsUrl: 'https://maps.app.goo.gl/5AATx1Q9o3kShwRA6',
    description: [
      'A narrow fjord-like canyon with vertical cliffs, a 30-meter arched bridge, fishing houses in the rock, and a tiny pebble beach.',
      'The sun reaches the water only for a short part of the day, which gives the place its dramatic contrast and cool microclimate.',
    ],
    quotes: [
      { text: 'Pure beauty and easily one of the most picture-perfect places on the Amalfi Coast.', source: 'exploredbymarta.com' },
      { text: 'Dramatic cliffs, a 30-meter arched bridge, fishermen\'s houses, and pristine waters.', source: 'exploredbymarta.com' },
      { text: 'The sun only shines inside the fjord for a couple of hours during the day.', source: 'exploredbymarta.com' },
    ],
    bestTime: 'Season-dependent. Ask locally when the sun reaches the fjord during your dates.',
    tips: [
      'Take the SITA bus to the bridge stop, then descend the stairs.',
      'You can also walk from Marina di Praia in about 15 minutes.',
      'Shoot both worlds: bridge from above, beach from below.',
    ],
    image: {
      src: '/staticpages/how-to-get/destination-positano.webp',
      alt: 'Dramatic Amalfi Coast cliff scenery used as a contextual preview for Furore',
      width: 1024,
      height: 1024,
    },
  },
  {
    slug: 'path-of-the-gods',
    title: 'Path of the Gods',
    city: 'Agerola / Nocelle',
    mapType: 'Hike',
    types: ['Hike', 'Panoramic View'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Hike',
    cost: 'Free',
    coordinates: { lat: 40.62234, lng: 14.5168 },
    isApproximate: true,
    mapsUrl: 'https://maps.app.goo.gl/5wQxP1UPKFKxHxwN6',
    locationNote: 'The classic route starts in Bomerano and finishes in Nocelle above Positano.',
    description: [
      'The most famous trail on the Amalfi Coast, crossing high mountain paths between Bomerano and Nocelle.',
      'It gives the coastline from above: Positano, cliffs, sea, and small towns laid out from a bird\'s-eye view.',
    ],
    quotes: [
      { text: 'Did you even visit the Amalfi Coast if you did not hike this trail?', source: 'exploredbymarta.com' },
      { text: 'One of the most breathtaking hikes in the world.', source: 'exploredbymarta.com' },
      { text: 'Take photos on the way there, before you are too sweaty.', source: 'lovehardtraveloften.com' },
    ],
    bestTime: 'Early morning before heat and crowds build.',
    tips: [
      'Budget around 12.3 km and 3.5 hours for a round trip.',
      'Take your best portraits on the outward leg.',
      'From Nocelle, descend to Positano by stairs or bus if you do not want to return on foot.',
    ],
    image: {
      src: '/staticpages/car-tours/Praiano-Hero-tours-amalfi-coast-by-car-2.webp',
      alt: 'High Amalfi Coast mountain and sea panorama',
      width: 1200,
      height: 900,
    },
  },
  {
    slug: 'praiano-san-gennaro',
    title: 'Chiesa di San Gennaro',
    city: 'Praiano',
    mapType: 'Architecture',
    types: ['Architecture', 'Viewpoint'],
    timeTags: ['Sunset', 'Golden Hour'],
    difficulty: 'Easy',
    cost: 'Free',
    coordinates: { lat: 40.61142, lng: 14.53002 },
    isApproximate: true,
    mapsUrl: searchMaps('Chiesa di San Gennaro Praiano'),
    description: [
      'A beautiful church square in Praiano with a majolica dome, terracotta facade, and panoramic coastal view.',
      'Praiano is less visited than Positano, so the same golden-hour coast mood feels slower and more local.',
    ],
    quotes: [
      { text: 'Included among the top Instagram locations of the Amalfi Coast.', source: 'exploredbymarta.com' },
      { text: 'The less visited town gives the square a calmer atmosphere.', source: 'local photo note' },
    ],
    bestTime: 'Sunset, when the cliffs and sea turn warm.',
    tips: [
      'Use the church square as the main shooting position.',
      'Compose the dome with sea behind it.',
      'Stay into blue hour if the sky is clear.',
    ],
    image: {
      src: '/photoshootings/couples/katerina-kuznezova-praiano-2021-002.jpg',
      alt: 'Praiano golden hour photoshoot on the Amalfi Coast',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'conca-dei-marini-monastero-santa-rosa',
    title: 'Monastero Santa Rosa',
    city: 'Conca dei Marini',
    mapType: 'Hidden Gem',
    types: ['Hotel/Viewpoint', 'Hidden Gem'],
    timeTags: ['Golden Hour', 'Sunset'],
    difficulty: 'Easy',
    cost: 'Drink required for non-guests',
    coordinates: { lat: 40.61783, lng: 14.57616 },
    isApproximate: true,
    mapsUrl: searchMaps('Monastero Santa Rosa Conca dei Marini'),
    description: [
      'A former seventeenth-century monastery turned five-star hotel, set high above the coast.',
      'The visual story is lemon trees, terraces, refined stone, and that wide-open height over the sea.',
    ],
    quotes: [
      { text: 'Honestly the most stunning place I have seen on the entire Amalfi Coast trip.', source: 'carinaberry.com' },
      { text: 'There is a perfect little swing placed between two lush lemon trees.', source: 'carinaberry.com' },
      { text: 'The view up there is out of this world.', source: 'carinaberry.com' },
    ],
    bestTime: 'Golden hour before sunset.',
    tips: [
      'Come for drinks if you are not staying at the hotel.',
      'Ask politely about the garden and terrace access.',
      'The lemon-tree swing is the signature lifestyle frame.',
    ],
    image: {
      src: '/staticpages/car-tours/Scenic-Coast/Scenic-Coast-amalfi-coast-tours-7.webp',
      alt: 'Elevated Amalfi Coast terrace and scenic road atmosphere',
      width: 1200,
      height: 900,
    },
  },
  {
    slug: 'path-of-the-lemons',
    title: 'Path of the Lemons',
    city: 'Minori / Maiori',
    mapType: 'Hike',
    types: ['Hike', 'Nature'],
    timeTags: ['Sunrise', 'Golden Hour'],
    difficulty: 'Moderate',
    cost: 'Free',
    coordinates: { lat: 40.65022, lng: 14.63611 },
    isApproximate: true,
    mapsUrl: searchMaps('Sentiero dei Limoni Minori Maiori'),
    description: [
      'A terraced lemon path between Minori and Maiori, full of green filtered light, fruit, stone steps, and coastal glimpses.',
      'It is one of the most sensory Amalfi frames: color, smell, texture, and a feeling of agricultural life above the sea.',
    ],
    quotes: [
      { text: 'The lemon groves of Amalfi are more than scenery; they are a sensory experience.', source: 'wezoree.com' },
      { text: 'Early morning is ideal, when mist clings to the hills and sun paints everything gently.', source: 'wezoree.com' },
    ],
    bestTime: 'Early morning for mist, cool air, and warm light through the leaves.',
    tips: [
      'Use lemon trees as foreground for portraits.',
      'Try a minimal frame: lemon sharp in front, coast blurred behind.',
      'Bring comfortable shoes for steps and uneven path.',
    ],
    image: {
      src: '/photoshootings/individual/Julietta/gallery1/Julietta_woods-Maiori-20245.webp',
      alt: 'Portrait in green Maiori landscape used as a contextual preview for the lemon path',
      width: 1200,
      height: 800,
    },
  },
  {
    slug: 'vietri-sul-mare-ceramics-street',
    title: 'Ceramics Street and Casa Colorata',
    city: 'Vietri sul Mare',
    mapType: 'Architecture',
    types: ['Architecture', 'Street Photo'],
    timeTags: ['Sunrise', 'Any Time'],
    difficulty: 'Easy',
    cost: 'Free',
    coordinates: { lat: 40.67132, lng: 14.72773 },
    isApproximate: true,
    mapsUrl: searchMaps('Casa Colorata Vietri sul Mare ceramics'),
    description: [
      'The first Amalfi Coast town from Salerno, known for ceramics, bright storefronts, and colorful houses.',
      'Casa Colorata and the ceramic streets give a graphic, playful alternative to the cliff-and-sea postcard.',
    ],
    quotes: [
      { text: 'Gorgeous ceramics street in Vietri sul Mare.', source: 'exploredbymarta.com' },
      { text: 'If you love hidden places, explore Vietri sul Mare and the less popular towns.', source: 'exploredbymarta.com' },
      { text: 'Less crowded than Positano or Amalfi, with an authentic local feel.', source: 'traveler impression' },
    ],
    bestTime: 'Morning for empty streets and soft light.',
    tips: [
      'Use ceramic shopfronts as color-blocked backgrounds.',
      'Casa Colorata works best as a geometric wide frame.',
      'Walk slowly: the good frames are in details and corners.',
    ],
    image: {
      src: '/staticpages/mainpage/for-guide.webp',
      alt: 'Colorful Amalfi Coast street detail used as a contextual preview for Vietri sul Mare',
      width: 1200,
      height: 900,
    },
  },
  {
    slug: 'sorrento-marina-grande',
    title: 'Marina Grande',
    city: 'Sorrento',
    mapType: 'Sea',
    types: ['Fishing Village', 'Street Photo', 'Sea'],
    timeTags: ['Sunrise', 'Sunset'],
    difficulty: 'Easy',
    cost: 'Free',
    coordinates: { lat: 40.6272, lng: 14.3705 },
    isApproximate: true,
    mapsUrl: searchMaps('Marina Grande Sorrento'),
    description: [
      'The remaining old fishing-village soul of Sorrento: bright houses, working boats, local restaurants, and Vesuvius in the distance.',
      'It feels less polished than the main town and is better for documentary-style travel portraits.',
    ],
    quotes: [
      { text: 'Small, cute, and far less crowded. It is the last remaining vestige of traditional Sorrento.', source: 'thatanxioustraveller.com' },
      { text: 'The charming Marina Grande in Sorrento.', source: 'exploredbymarta.com' },
      { text: 'Residents may occasionally be sensitive about property photos.', source: 'thatanxioustraveller.com' },
    ],
    bestTime: 'Morning or just before sunset.',
    tips: [
      'Use the metal pier for Vesuvius, boats, and houses in one frame.',
      'Avoid heels on the pier; it can be slippery.',
      'Be respectful when photographing homes and residents.',
    ],
    image: {
      src: '/staticpages/video/atrani-sorrento-video.webp',
      alt: 'Sorrento coast video preview used for Marina Grande context',
      width: 1200,
      height: 675,
    },
  },
  {
    slug: 'sorrento-vallone-dei-mulini',
    title: 'Vallone dei Mulini',
    city: 'Sorrento',
    mapType: 'Hidden Gem',
    types: ['Ruins', 'Hidden Gem'],
    timeTags: ['Any Time'],
    difficulty: 'Easy',
    cost: 'Free',
    coordinates: { lat: 40.62645, lng: 14.37686 },
    isApproximate: true,
    mapsUrl: searchMaps('Vallone dei Mulini Sorrento'),
    locationNote: 'Behind Hotel Antiche Mura, near Piazza Tasso.',
    description: [
      'An abandoned mill in a deep gorge, swallowed by ferns and greenery in the middle of Sorrento.',
      'You do not enter the valley; the photograph is taken from above through the railings, which makes it feel like a hidden world beneath the city.',
    ],
    quotes: [
      { text: 'Quite a jaw-dropping moment when you find it.', source: 'thatanxioustraveller.com' },
      { text: 'A photograph of this invokes curiosity about ruined sites.', source: 'thatanxioustraveller.com' },
    ],
    bestTime: 'Any time, because the gorge is shaded.',
    tips: [
      'Look over the railings near Hotel Antiche Mura.',
      'Use a longer focal length to isolate the ruin and ferns.',
      'Lean into the green, mysterious mood.',
    ],
    image: {
      src: '/staticpages/video/atrani-sorrento-video.webp',
      alt: 'Sorrento area preview used as a contextual image for Vallone dei Mulini',
      width: 1200,
      height: 675,
    },
  },
  {
    slug: 'amalfi-coast-boat-view',
    title: 'Boat View from the Sea',
    city: 'Amalfi Coast',
    mapType: 'Sea',
    types: ['Sea', 'Boat', 'Experience'],
    timeTags: ['Golden Hour', 'Sunset'],
    difficulty: 'Easy',
    cost: 'Varies: group tours often EUR 50-80, private boats EUR 200+',
    coordinates: { lat: 40.6212, lng: 14.5588 },
    isApproximate: true,
    mapsUrl: searchMaps('Amalfi Coast boat tour'),
    locationNote: 'A moving photo location along the coastline.',
    description: [
      'The coast from the water is a completely different composition: villages stacked above cliffs, caves, arches, and towns lighting up from below.',
      'Many of these angles cannot be made from land. The boat becomes both viewpoint and foreground.',
    ],
    quotes: [
      { text: 'There is no better way to see the Amalfi Coast than from the water.', source: 'thatonepointofview.com' },
      { text: 'Seeing the towns light up from the sea as the sun dips below the horizon is pure magic.', source: 'thatonepointofview.com' },
      { text: 'Tell your skipper that you want to take photos so he knows when to stop the boat.', source: 'lovehardtraveloften.com' },
    ],
    bestTime: 'Golden hour and blue hour after sunset.',
    tips: [
      'Tell the skipper you are planning photos before you leave.',
      'Use faster shutter speeds because the boat moves.',
      'Blue hour gives town lights plus deep blue sky.',
    ],
    image: {
      src: '/pre-footer/boat-tours-in-amalfi.webp',
      alt: 'Boat tour view on the Amalfi Coast',
      width: 1200,
      height: 900,
    },
  },
  {
    slug: 'capri-faraglioni',
    title: 'Faraglioni',
    city: 'Capri',
    mapType: 'Sea',
    types: ['Nature', 'Iconic', 'Sea'],
    timeTags: ['Any Time'],
    difficulty: 'Easy',
    cost: 'Included in most boat tours around Capri',
    coordinates: { lat: 40.54528, lng: 14.25208 },
    isApproximate: true,
    mapsUrl: searchMaps('Faraglioni Capri'),
    description: [
      'Three monumental sea stacks rising from the water beside Capri, one of the most recognizable Italian coastal icons.',
      'Small boats often pass through the arch in the middle rock, giving a fast, unforgettable frame.',
    ],
    quotes: [
      { text: 'Breathtaking in person; a must-have photo from the Amalfi Coast.', source: 'lovehardtraveloften.com' },
      { text: 'Have your camera ready and quickly snap a shot as you go through the passageway.', source: 'lovehardtraveloften.com' },
    ],
    bestTime: 'Depends on your boat route and sea conditions.',
    tips: [
      'Be ready before the boat enters the arch.',
      'For a land view, use Punta Tragara or Belvedere Tragara.',
      'A wide lens works well from a small boat.',
    ],
    image: {
      src: '/pre-footer/boat-tours-in-amalfi.webp',
      alt: 'Boat on Mediterranean water used as a contextual preview for Capri Faraglioni',
      width: 1200,
      height: 900,
    },
  },
  {
    slug: 'capri-monte-solaro',
    title: 'Monte Solaro',
    city: 'Capri',
    mapType: 'Viewpoint',
    types: ['Viewpoint', 'Panoramic'],
    timeTags: ['Sunrise', 'Any Time'],
    difficulty: 'Easy',
    cost: 'Chairlift is usually around EUR 12 return',
    coordinates: { lat: 40.55594, lng: 14.22277 },
    isApproximate: true,
    mapsUrl: searchMaps('Monte Solaro Anacapri chairlift'),
    description: [
      'The highest point on Capri, reached by chairlift from Anacapri, with a 360-degree view over the island and the Mediterranean.',
      'Boats become tiny white marks below, and the whole island finally reads as a complete shape.',
    ],
    quotes: [
      { text: 'Sweeping views of the island, boats below, and the blue Mediterranean as far as the eye can see.', source: 'lovehardtraveloften.com' },
      { text: 'Have the photographer stand on the higher viewing area and place the subject on the lower one.', source: 'lovehardtraveloften.com' },
    ],
    bestTime: 'Clear morning for visibility and cooler light.',
    tips: [
      'Take the chairlift from Anacapri; the ride is about 10 minutes.',
      'For portraits, place the subject lower and shoot from the higher platform.',
      'Check wind and visibility before committing.',
    ],
    image: fallbackCoastImage,
  },
]

export const photoSpotBySlug = new Map(photoSpots.map((spot) => [spot.slug, spot]))
