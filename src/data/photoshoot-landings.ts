import { site } from './site'
import { photographyPackages } from './photographer'
import { getPhotoshoot, getPhotoshootCard } from './photoshoots'
import type { PhotoshootCardData } from './photoshoot-types'

// Keyword landing pages for photoshoots. Every fact here comes from the hub
// (/photoshootings/), src/data/photographer.ts or the published story JSON files.
// Prose fields marked `html` may contain simple links; everything else is plain text.

export type PackageKey = keyof typeof photographyPackages
export type LandingSlug =
  | 'positano-photographer'
  | 'ravello-photographer'
  | 'amalfi-photographer'
  | 'path-of-the-gods-photographer'
  | 'proposal-photographer'
  | 'couple-photoshoot'
  | 'family-photoshoot'
  | 'solo-photoshoot'

export type LandingCard = { icon: string; title: string; text: string }
export type LandingStep = { title: string; text: string }
export type LandingSection = {
  id?: string
  eyebrow: string
  title: string
  accent: string
  /** html */
  paragraphs?: string[]
  cards?: LandingCard[]
  steps?: LandingStep[]
  /** html */
  list?: string[]
}
export type LandingFaq = { q: string; a: string }
export type LandingPage = {
  slug: LandingSlug
  group: 'location' | 'occasion'
  nav: { label: string; desc: string; icon: string }
  title: string
  description: string
  hero: { slug: string; alt: string; eyebrow: string; lead: string; accent: string; intro: string }
  answer: { title: string; paragraphs: string[] }
  facts: { label: string; value: string }[]
  sections: LandingSection[]
  shoots: { eyebrow: string; title: string; accent: string; desc: string; slugs: string[]; columns?: 2 | 3 | 4 }
  pricing?: 'solo' | 'couple'
  pricingNote?: string
  faqs: LandingFaq[]
  service: { name: string; serviceType: string; areaServed: string[]; packages: PackageKey[]; priceNote: string }
  related: LandingSlug[]
}

export const businessId = `${site.url}/#business`
export const landingUrl = (slug: LandingSlug) => `${site.url}/photoshootings/${slug}/`
export const landingPath = (slug: LandingSlug) => `/photoshootings/${slug}/`

// Same zones and fees as the "Travel Zones" table on /photoshootings/.
export const travelZones = [
  { zone: 'Base', level: 0, towns: 'Atrani, Amalfi', fee: 'Included' },
  { zone: 'Zone 1', level: 1, towns: 'Ravello, Minori, Maiori', fee: '+€30' },
  { zone: 'Zone 2', level: 2, towns: 'Cetara, Vietri sul Mare, Tramonti, Scala', fee: '+€50' },
  { zone: 'Zone 3', level: 3, towns: 'Positano, Praiano, Furore', fee: '+€70' },
  { zone: 'Zone 4', level: 4, towns: 'Sorrento, Salerno', fee: '+€100' },
  { zone: 'Zone 5', level: 5, towns: 'Capri, Naples, Pompeii', fee: '+€150 + transport' },
]
export const travelNote = 'Travel time is not deducted from your session. For zones 3–5, minimum session is 90 minutes. Booking 120+ minutes in zones 1–2 reduces the travel fee by 50%.'

// The older stories have hand-written card copy on the hub; this mirrors it (dashes removed, Regan tagged Engagement).
const cardCopy: Record<string, Partial<PhotoshootCardData>> = {
  shifa: { title: 'Amalfi Influencer Photoshoot', desc: 'Bold poses, sun-kissed streets, and content that stops the scroll.', tag: 'Influencer' },
  loreana: { title: 'The Perfect Gift to Yourself', desc: 'A solo escape through Ravello’s gardens and terraces at golden hour.', tag: 'Personal' },
  lashada: { title: 'Morning Glow. True Atrani.', desc: 'Early light on pastel walls in Atrani, before the world wakes up.', tag: 'Personal' },
  julietta: { title: 'Gifted Sunset Memories', desc: 'Warm tones and forest paths: a gift wrapped in golden coastal light.', tag: 'Personal' },
  'ravello-photoshooting': { title: 'Ravello Light Elegance', desc: 'Villa Rufolo backdrop, soft drapery, and Mediterranean elegance.', tag: 'Editorial' },
  ayuna: { title: 'Ayuna’s Photographic Memoir', desc: 'A visual diary through the alleyways and staircases of Atrani.', tag: 'Personal' },
  camelia: { title: 'Camelia: Beautiful Experience', desc: 'Mountain roads, vintage Vespa, and cinematic countryside frames.', tag: 'Moto' },
  'regan-tay-ravello': { title: 'Ravello Romance', desc: 'Taylor & Regan: a love story among Ravello’s views and ancient gardens.', tag: 'Engagement' },
  'olga-marat': { title: 'Symphony of Love', desc: 'Olga & Marat: stolen glances and laughter in the heart of Atrani.', tag: 'Couple' },
}

export const landingCard = (slug: string): PhotoshootCardData => ({ ...getPhotoshootCard(slug), ...cardCopy[slug] })

export const landingHero = (page: LandingPage) => {
  const { hero } = getPhotoshoot(page.hero.slug)
  return { src: hero.src, srcset: hero.srcset, width: hero.width, height: hero.height, focal: hero.focal, mobileFocal: hero.mobileFocal || hero.focal, alt: page.hero.alt }
}

const allPackages = Object.keys(photographyPackages) as PackageKey[]
const couplePackages: PackageKey[] = ['coupleMini', 'golden', 'panorama']
const soloPackages: PackageKey[] = ['portrait', 'soloSignature', 'coastal']

export const landingPages: LandingPage[] = [
  // ───────────────────────────── POSITANO ─────────────────────────────
  {
    slug: 'positano-photographer',
    group: 'location',
    nav: { label: 'Positano', desc: 'The beach and stairways at sunrise', icon: 'ph-umbrella-simple' },
    title: 'Positano Photographer for Couples & Families | Amalfi.Day',
    description: 'Positano photoshoots with Greg, a photographer based in Atrani: sunrise couple and family sessions on the beach and steps, real stories and clear travel fees.',
    hero: {
      slug: 'stephanie-positano',
      alt: 'Stephanie and her partner on Positano beach in the early morning, with the town behind them',
      eyebrow: 'Couple & family photoshoots in Positano',
      lead: 'Positano',
      accent: 'Photographer',
      intro: 'Positano is best photographed before it wakes up. I’ll meet you at first light, find the quiet corners and help you pose.',
    },
    answer: {
      title: 'How does a Positano photoshoot work?',
      paragraphs: [
        'I’m Greg (Gregory), a photographer based in Atrani, and I photograph couples, families and solo travellers in Positano, usually starting at sunrise while the beach and stairways are still empty. Positano sessions use my standard packages plus a €70 travel fee, with a 90-minute minimum, so the two-hour Coastal Story (€550 for a couple, €480 solo) is the natural fit.',
        'To book, send your date through the request form on this page or on WhatsApp. I reply personally, and a 30% deposit confirms the date.',
      ],
    },
    facts: [
      { label: 'Travel fee', value: '+€70 (zone 3)' },
      { label: 'Minimum session', value: '90 minutes' },
      { label: 'Best light', value: 'Sunrise to early morning' },
      { label: 'Stories here', value: 'Two couples, one family' },
      { label: 'Delivery', value: 'Within 7 business days' },
      { label: 'Languages', value: 'English, Italian, Russian' },
    ],
    sections: [
      {
        eyebrow: 'Light & crowds',
        title: 'Why I start Positano',
        accent: 'at sunrise',
        paragraphs: [
          'I don’t photograph in Positano as often as in Atrani or Amalfi, so when a couple wants it, I plan the morning around one thing: space. Positano is a small town built up a cliff, and in summer its lanes fill quickly. Ashley and her partner were happy to start very early, and in those quiet hours we could walk, stop and photograph without waiting for people to pass.',
          'I’ve also seen the other side. Sally and Rose’s family were staying in a villa in Praiano, with a lot of people to get into one car, so we reached the beach after golden hour. Other visitors were starting to arrive. It was still early enough to have good light and room to work, but every half hour later means sharing more of the frame.',
          'The payoff is the light. On Ashley’s summer morning it needed almost no adjustment afterwards, and Stephanie’s June morning gave us photographs full of colour.',
        ],
      },
      {
        eyebrow: 'Where we photograph',
        title: 'Positano spots',
        accent: 'that work early',
        cards: [
          { icon: 'ph-umbrella-simple', title: 'Spiaggia Grande', text: 'The main beach is the classic frame: the town stacked up behind you, the blue and striped loungers, the boats on the sand. All three of my Positano stories use it, because early in the morning it is wide and calm.' },
          { icon: 'ph-stairs', title: 'Beach steps & waterfront', text: 'The steps up from the sand, the railings above the water and the café tables along the front give you sitting and walking photographs a few metres apart. Stephanie and her partner moved between all of them.' },
          { icon: 'ph-signpost', title: 'The painted boat', text: 'The wooden boat with the town’s name on it sits on the beach and is one of the best-known frames in Positano. Stephanie and her partner have several photographs beside it.' },
          { icon: 'ph-flower', title: 'Flower-lined steps & the church', text: 'Bougainvillea stairways and lanes give colour and shade once the sun is higher. We photographed Sally and Rose’s whole family sitting together on the church steps.' },
        ],
      },
      {
        eyebrow: 'Practical',
        title: 'Stairs, parking',
        accent: 'and timing',
        list: [
          '<strong>Stairs everywhere.</strong> Positano is built on a slope, with steps between almost every spot. Wear shoes you can walk in and carry the nice ones in a bag.',
          '<strong>Meeting point.</strong> We agree it in advance. For Sally and Rose’s family, who arrived together by car, a car park in Positano was the simplest place to meet.',
          '<strong>Parking.</strong> Spaces are few and expensive in season. If you are driving in, allow extra time before sunrise.',
          '<strong>Why 90 minutes.</strong> Positano is in travel zone 3, which has a 90-minute minimum because I travel from Atrani. Travel time is not deducted from your session.',
          '<strong>Staying in Praiano?</strong> It is in the same zone. <a href="/photoshootings/nick-family-praiano/">Nick’s family session in Praiano</a> finished at a view towards Positano.',
        ],
      },
    ],
    shoots: {
      eyebrow: 'Real sessions',
      title: 'Photoshoots in',
      accent: 'Positano',
      desc: 'Two couples and a family, all photographed in the morning, plus one family session from neighbouring Praiano.',
      slugs: ['ashley-positano', 'stephanie-positano', 'sally-rose-family-positano', 'nick-family-praiano'],
      columns: 2,
    },
    faqs: [
      { q: 'How much does a photoshoot in Positano cost?', a: 'A Positano session uses my standard packages plus a €70 travel fee, because Positano is in travel zone 3. The minimum session there is 90 minutes, so the two-hour Coastal Story fits best: €550 for a couple or €480 for one person, with 120+ retouched photos. Couple prices cover both people, and a 30% deposit confirms the date.' },
      { q: 'What time should a Positano photoshoot start?', a: 'As close to sunrise as you can manage, especially from June to September. In the first hour the beach, the steps and the lanes are quiet enough to move freely. When one family I photographed arrived after golden hour, other visitors were already appearing, although there was still room. By late morning the town is full and the light is much harsher.' },
      { q: 'Where are the best photo spots in Positano?', a: 'The main beach, Spiaggia Grande, with the town rising behind it, is the classic. Close by are the beach steps, the railings and cafés along the waterfront, the painted wooden boat with the town’s name on it, and the flower-lined stairways and church steps just above the beach. Early in the morning all of them are a few minutes’ walk apart.' },
      { q: 'Is Positano or Atrani better for a photoshoot?', a: 'Choose by the backdrop you want. Positano gives you the famous beach and stacked houses, but it is busier and adds a €70 travel fee with a 90-minute minimum. Atrani and Amalfi are my home base, are included in every package and stay quiet for longer, with a small square, white staircases and views from the coast road.' },
      { q: 'Do you photograph families in Positano?', a: 'Yes. Sally and Rose’s family, who have photographs taken every year in a different place, met me in Positano for a session that grew from one hour to two. We worked on the beach, the steps and the waterfront. For families, a couple package covers two people and each additional person is €30.' },
    ],
    service: {
      name: 'Positano photoshoots with Greg',
      serviceType: 'Couple, family and portrait photography in Positano',
      areaServed: ['Positano', 'Praiano'],
      packages: ['panorama', 'coastal'],
      priceNote: 'Base package price. Positano sessions add a €70 travel fee (zone 3) and have a 90-minute minimum.',
    },
    related: ['amalfi-photographer', 'ravello-photographer', 'family-photoshoot', 'couple-photoshoot'],
  },

  // ───────────────────────────── RAVELLO ─────────────────────────────
  {
    slug: 'ravello-photographer',
    group: 'location',
    nav: { label: 'Ravello', desc: 'Gardens, terraces and engagements', icon: 'ph-flower' },
    title: 'Ravello Photographer for Engagement & Solo Shoots | Amalfi.Day',
    description: 'Ravello photoshoots with Greg: engagement, couple, solo and fashion sessions among gardens, terraces and quiet lanes above the sea. Real stories and prices.',
    hero: {
      slug: 'regan-tay-ravello',
      alt: 'Taylor and Regan walking together during their engagement photoshoot in Ravello',
      eyebrow: 'Engagement, couple & solo photoshoots in Ravello',
      lead: 'Ravello',
      accent: 'Photographer',
      intro: 'Gardens, terraces and calm lanes high above the sea. Ravello is where I go when Amalfi is too crowded.',
    },
    answer: {
      title: 'What is a Ravello photoshoot like?',
      paragraphs: [
        'I’m Greg, a photographer based in Atrani, just below Ravello, and I photograph engagement sessions, couples, solo travellers and fashion stories there. Ravello sits more than 300 metres above the sea and stays much calmer than Amalfi, so it is one of the few places on the coast where a late-afternoon, golden-hour session works as well as sunrise.',
        'Any package can be booked in Ravello with a €30 travel fee, halved when you book 120 minutes or more. Send a request from this page or on WhatsApp to check your date.',
      ],
    },
    facts: [
      { label: 'Travel fee', value: '+€30 (zone 1)' },
      { label: '120+ minutes', value: 'Travel fee halved' },
      { label: 'Best light', value: 'Golden hour or early morning' },
      { label: 'Backdrops', value: 'Gardens, terraces, lanes' },
      { label: 'Stories here', value: 'Engagement, solo, fashion' },
      { label: 'Languages', value: 'English, Italian, Russian' },
    ],
    sections: [
      {
        eyebrow: 'Why Ravello',
        title: 'Quiet,',
        accent: 'in the right way',
        paragraphs: [
          'Ravello is one of my favourite places to photograph, and I invite almost everyone up there. It is quiet in a way the waterfront towns rarely are: you hear the breeze in the gardens, and the piazza has room to move. Loreana’s session started in Amalfi, which was packed that day, so we went up to Ravello and found softer colours and calmer light.',
          'In the gardens the light stays soft and even for much of the day. That is why Ravello suits long dresses and fashion looks: sun-washed stone, deep greens and the blue of the coast sit behind you without competing with what you wear.',
        ],
      },
      {
        eyebrow: 'Where we photograph',
        title: 'Ravello backdrops',
        accent: 'I return to',
        cards: [
          { icon: 'ph-flower', title: 'Villa Rufolo', text: 'The gardens and stone of Villa Rufolo were the backdrop for my Ravello Light Elegance fashion story. It is a ticketed site with its own rules for visitors, so mention it in your request if you want to include it.' },
          { icon: 'ph-mountains', title: 'Terraces & viewpoints', text: 'Terraces stacked above the sea give Ravello its sense of height. Loreana’s birthday portraits were made at a viewpoint and on terraces, with the coast far below her.' },
          { icon: 'ph-path', title: 'Stone lanes & old villas', text: 'Narrow lanes and warm stone walls link the gardens and give variety between them. Taylor and Regan’s October engagement session followed these paths between gardens and historic villas.' },
        ],
      },
      {
        eyebrow: 'Practical',
        title: 'Timing, getting up',
        accent: '& what to wear',
        list: [
          '<strong>Light.</strong> Ravello works at sunrise and in the late afternoon. Loreana’s photographs end with the last rays of the day; Taylor and Regan had warm October sunshine.',
          '<strong>Getting there.</strong> Ravello is up a winding road from Amalfi, with buses from Amalfi and taxis. I travel up to meet you, and the travel fee covers that.',
          '<strong>Walking.</strong> The centre is compact, but the gardens have gravel paths and steps. Comfortable shoes for the walk, something nicer for the photographs.',
          '<strong>Dresses.</strong> Flowing fabric photographs beautifully here. In my fashion story the fabric caught the light and the silhouettes stayed crisp against the architecture.',
          '<strong>A second session.</strong> Stephanie and her partner photographed in Positano and wanted to continue their story in Ravello next. <a href="/photoshootings/positano-photographer/">See Positano</a>.',
        ],
      },
    ],
    shoots: {
      eyebrow: 'Real sessions',
      title: 'Photoshoots in',
      accent: 'Ravello',
      desc: 'An engagement, a solo birthday portrait session and a fashion story, all photographed in Ravello.',
      slugs: ['regan-tay-ravello', 'loreana', 'ravello-photoshooting'],
      columns: 3,
    },
    faqs: [
      { q: 'How much does a photoshoot in Ravello cost?', a: 'Any of my packages can be booked in Ravello with a €30 travel fee, which is halved when you book 120 minutes or more. Couple sessions are €250 for 30 minutes, €350 for 60 and €550 for 120; solo sessions are €200, €300 and €480. Every package includes posing help, professional retouching and a private online gallery.' },
      { q: 'Is Ravello good for an engagement photoshoot?', a: 'Yes. It is calm, green and high above the sea, so you get gardens, old villas and wide coastal views without the crowds of the waterfront towns. Taylor and Regan photographed their engagement here in October, after Regan’s proposal, and they wanted to turn the photographs into a book afterwards.' },
      { q: 'What is the best time of day for photos in Ravello?', a: 'Ravello is one of the few places on the coast where the late afternoon works well, not only sunrise. The gardens hold soft, even light for much of the day, and the last sun gives warm golden-hour portraits, as in Loreana’s session. In July and August, early morning is still the coolest and quietest choice.' },
      { q: 'Can we take photos at Villa Rufolo or Villa Cimbrone?', a: 'Both are ticketed gardens with their own rules for visitors and photo sessions, and those rules can change. I have photographed a fashion story with Villa Rufolo as the backdrop. If a particular garden matters to you, mention it in your request so we can check what is allowed for your date before you plan around it.' },
      { q: 'Can you organise a last-minute photoshoot in Ravello?', a: 'Sometimes. Loreana messaged me through GetYourGuide on a Sunday morning, asking for a photoshoot within a few hours; we started in Amalfi and moved up to Ravello. It depends on my calendar. From June to September, booking two to four weeks ahead gives you the best choice of dates.' },
    ],
    service: {
      name: 'Ravello photoshoots with Greg',
      serviceType: 'Engagement, couple, solo and fashion photography in Ravello',
      areaServed: ['Ravello'],
      packages: allPackages,
      priceNote: 'Base package price. Ravello sessions add a €30 travel fee (zone 1), halved for sessions of 120 minutes or more.',
    },
    related: ['amalfi-photographer', 'positano-photographer', 'proposal-photographer', 'solo-photoshoot'],
  },

  // ───────────────────────────── AMALFI & ATRANI ─────────────────────────────
  {
    slug: 'amalfi-photographer',
    group: 'location',
    nav: { label: 'Amalfi & Atrani', desc: 'My home towns, no travel fee', icon: 'ph-sun-horizon' },
    title: 'Amalfi & Atrani Photographer: Sunrise Photoshoots | Amalfi.Day',
    description: 'Amalfi and Atrani photoshoots with Greg, who lives in Atrani: sunrise sessions from the cathedral steps along the coast to Atrani, no travel fee, from €200.',
    hero: {
      slug: 'esmeralda-cortez-amalfi',
      alt: 'A couple walking hand in hand along the coast road between Amalfi and Atrani at sunrise',
      eyebrow: 'Sunrise photoshoots in Amalfi & Atrani',
      lead: 'Amalfi & Atrani',
      accent: 'Photographer',
      intro: 'My home streets. We meet at first light on the cathedral steps and walk the coast to Atrani while both towns are still asleep.',
    },
    answer: {
      title: 'Who photographs couples and travellers in Amalfi and Atrani?',
      paragraphs: [
        'I’m Greg (Gregory), a photographer who lives in Atrani, a few minutes’ walk from Amalfi, and these two towns are my everyday route. Most sessions start at sunrise on the steps of Amalfi Cathedral, then follow the harbour and the coast road to Atrani’s viewpoints, staircases and square.',
        'There is no travel fee here: solo packages start at €200 and couple packages at €250. You can book through the form on this page, on WhatsApp, or through my sunrise photoshoot on GetYourGuide.',
      ],
    },
    facts: [
      { label: 'Travel fee', value: 'Included (base zone)' },
      { label: 'Meeting point', value: 'Amalfi Cathedral steps' },
      { label: 'Start', value: 'A few minutes before sunrise' },
      { label: 'Route', value: 'Amalfi to Atrani on foot' },
      { label: 'Prices from', value: '€200 solo, €250 couple' },
      { label: 'Also on', value: 'GetYourGuide, Airbnb, Localgrapher' },
    ],
    sections: [
      {
        eyebrow: 'The route',
        title: 'From the cathedral',
        accent: 'to Atrani',
        paragraphs: [
          'The staircase of Amalfi Cathedral is the easiest meeting point in town: everyone can find it, and at dawn it is almost empty. Nathalie met me there at 6:50 on an autumn morning, when, in her words, the town was “still quiet and almost empty.” From the steps we use the cathedral portico and arches, then the harbour, the pier and the beach.',
          'From there we follow the coast towards Atrani. The viewpoints above the village, the railing over its rooftops, the white staircases, the clock tower and the little square are where many of my favourite frames come from. Atrani is where I live, so people greet us on the way. When Takamasa and his partner walked through in her wedding dress, almost every passing car stopped so people could call out “Auguri!”',
        ],
      },
      {
        eyebrow: 'Sunrise',
        title: 'Why I ask you',
        accent: 'to meet so early',
        paragraphs: [
          'I always ask guests to arrive as early as they can, ideally a couple of minutes before sunrise. In June that means around half past five. In mid-August, Lashanda and I were working at the Atrani bus stop by about 06:15, and in early autumn Nathalie’s 6:50 start was early enough.',
          'The reason is light and space. At sunrise the first rays come over the mountains onto Atrani’s shore, as in Hinad’s session, and the harbour gives soft light reflected off the sea with clean backgrounds. Later, bright Amalfi sunshine makes photographs look hot and summery, almost like film. That can be lovely too, but by then the streets are busy.',
          'Allow for traffic on the coast road, even at dawn. Nilsa and her husband set off by car while it was still dark and reached Amalfi a little after sunrise. If you are staying in another town, leave earlier than the map suggests.',
        ],
      },
      {
        eyebrow: 'Good to know',
        title: 'A few local',
        accent: 'details',
        list: [
          '<strong>No travel fee.</strong> Atrani and Amalfi are my base zone, included in every package.',
          '<strong>Two towns in one session.</strong> The two-hour Coastal Story covers four to six spots across Amalfi and Atrani, with time for two outfit changes.',
          '<strong>Summer heat.</strong> Tom and Sam’s session fell during an August heatwave. We met fifteen minutes before sunrise and stopped every few steps rather than rushing.',
          '<strong>Festivals.</strong> Lashanda’s birthday shoot fell during Atrani’s Blue Fish Festival, and the decorations turned every corner into a set.',
          '<strong>After the shoot.</strong> I share my Amalfi Coast guide, with places to visit and restaurants, with everyone I photograph.',
          '<strong>Villas nearby.</strong> Conca dei Marini, a short drive west, is where I photographed <a href="/photoshootings/jassi-conca-proposal/">Jassi’s proposal</a> and <a href="/photoshootings/anh-hoang-conca-dei-marini/">Anh’s April morning</a>.',
        ],
      },
    ],
    shoots: {
      eyebrow: 'Real sessions',
      title: 'Photoshoots in',
      accent: 'Amalfi & Atrani',
      desc: 'Couples, post-wedding sessions and solo sunrise portraits along my usual route between the two towns.',
      slugs: ['esmeralda-cortez-amalfi', 'nilsa-otanez-amalfi-atrani', 'takamasa-shigemi-amalfi-atrani', 'nathalie-amalfi', 'hinad-amalfi-sunrise', 'tom-sam-atrani', 'shifa', 'lashada', 'olga-marat'],
      columns: 3,
    },
    faqs: [
      { q: 'How much is a photoshoot in Amalfi or Atrani?', a: 'Amalfi and Atrani are my base zone, so there is no travel fee. Solo sessions are €200 for 30 minutes, €300 for 60 and €480 for two hours; couple sessions are €250, €350 and €550 for both of you. The 60 and 120-minute sessions include preview photos within 24 hours, and everything is delivered in a private online gallery within 7 business days.' },
      { q: 'Where do we meet for an Amalfi photoshoot?', a: 'Usually on the staircase of Amalfi Cathedral, in Piazza Duomo. It is the easiest place in town to find, and at sunrise it is nearly empty, so we can start photographing right there. If you are staying in Atrani or at a hotel along the route, we can meet closer to you. We agree the exact spot by WhatsApp or email beforehand.' },
      { q: 'Can we walk from Amalfi to Atrani during the shoot?', a: 'Yes, and it is my favourite route. Atrani is a few minutes’ walk from Amalfi along the coast road, with viewpoints over the village on the way. The 60-minute packages cover two or three nearby spots, while the two-hour Coastal Story is planned for four to six spots across both towns.' },
      { q: 'What time is sunrise in Amalfi?', a: 'It changes a lot through the year: roughly half past five in late June, around six in early August and close to seven in early October. I ask guests to arrive a couple of minutes before sunrise, so we can start calmly and enjoy the soft light before the sun gets strong. I confirm the exact time for your date when we plan.' },
      { q: 'Is Atrani good for photos when Amalfi is crowded?', a: 'Yes. Atrani is one of the smallest towns in Italy and stays calm even when Amalfi’s waterfront is busy. Its square, white staircases, clock tower and the railing above the rooftops are all within a few minutes of each other. If both towns are too busy for you, Ravello, up the hill, is another quiet option.' },
    ],
    service: {
      name: 'Amalfi and Atrani photoshoots with Greg',
      serviceType: 'Couple, solo and post-wedding photography in Amalfi and Atrani',
      areaServed: ['Amalfi', 'Atrani'],
      packages: allPackages,
      priceNote: 'Base zone: no travel fee in Amalfi or Atrani.',
    },
    related: ['ravello-photographer', 'positano-photographer', 'couple-photoshoot', 'solo-photoshoot'],
  },

  // ───────────────────────────── PATH OF THE GODS ─────────────────────────────
  {
    slug: 'path-of-the-gods-photographer',
    group: 'location',
    nav: { label: 'Path of the Gods', desc: 'Mountain views at golden hour', icon: 'ph-mountains' },
    title: 'Path of the Gods Photoshoot & Proposal Photographer | Amalfi.Day',
    description: 'A Path of the Gods photoshoot with Greg: proposal and couple portraits above the coast at golden hour, plus honest advice on the walk, timing and outfits.',
    hero: {
      slug: 'renaud-path-of-the-gods',
      alt: 'Renaud and his partner on the rocks of the Path of the Gods, high above the Amalfi Coast',
      eyebrow: 'Proposal & couple photoshoots on the Sentiero degli Dei',
      lead: 'Path of the Gods',
      accent: 'Photographer',
      intro: 'Mountain paths, the whole coast below you and evening light. It takes a walk to get there, and it’s worth it.',
    },
    answer: {
      title: 'Can you have a photoshoot on the Path of the Gods?',
      paragraphs: [
        'Yes. I photographed Renaud’s proposal there, high above the coast at golden hour, and I plan Path of the Gods sessions for couples who want mountains and sea in the same frame. We meet at the start of the trail in Agerola, walk to a viewpoint we have chosen together, and photograph as the evening light comes in.',
        'Agerola isn’t in my standard travel-zone table, so send a request with your date and I’ll confirm the travel cost and timing before you book.',
      ],
    },
    facts: [
      { label: 'Trailhead', value: 'Bomerano, Agerola' },
      { label: 'Trail', value: 'About 7–8 km to Nocelle' },
      { label: 'Best light', value: 'Late afternoon to sunset' },
      { label: 'Bring', value: 'Walking shoes, outfits in a bag' },
      { label: 'Travel fee', value: 'Quoted on request' },
      { label: 'Story here', value: 'Renaud’s proposal' },
    ],
    sections: [
      {
        eyebrow: 'Renaud’s story',
        title: 'Two kilometres',
        accent: 'and worth every step',
        paragraphs: [
          'We had agreed to meet at the start of the trail in Agerola, where there is already a good viewpoint. Renaud and his partner are keen hikers, though, and by the time I arrived they had walked ahead and found somewhere they liked more. It was about two kilometres further on: mountain path, steps and my camera bag. They apologised most of the way, and we laughed the rest.',
          'The plan had been for me to hide and photograph the proposal unseen. Finding their exact spot alone wasn’t realistic, so we walked there together and recreated the proposal in a few different outfits. Then golden hour arrived, the coast turned warm below us, and the long walk suddenly felt like a very good idea.',
        ],
      },
      {
        eyebrow: 'About the trail',
        title: 'What to expect',
        accent: 'up there',
        paragraphs: [
          'The Path of the Gods (Sentiero degli Dei) runs along the mountains from Bomerano, in Agerola, to Nocelle above Positano. It is roughly 7–8 km, on rocky paths with stretches of steps and little shade. You don’t need to walk all of it for photographs: Renaud’s viewpoint was about two kilometres from the start.',
        ],
        list: [
          '<strong>Light.</strong> In the evening the sun warms the cliffs and the coastline far below. Renaud’s portraits were made at golden hour and into sunset.',
          '<strong>Heat.</strong> In summer, avoid the middle of the day. With so little shade, you want to reach the viewpoint fresh.',
          '<strong>Outfits.</strong> Renaud and his partner brought several changes of clothes, and we had time to choose the looks together. Walk in proper shoes and carry the photo outfits in a backpack.',
          '<strong>Getting back.</strong> An evening session means returning in fading light. Buses run between Amalfi and Agerola, but plan your transport back before the day.',
          '<strong>Session length.</strong> Allow time for the walk to the viewpoint as well as the photographs. For outfit changes and a recreated proposal, a two-hour session is realistic.',
          '<strong>Planning a surprise?</strong> Hiding on a trail is harder than at a villa. <a href="/photoshootings/proposal-photographer/">Read how a secret proposal works</a>.',
        ],
      },
    ],
    shoots: {
      eyebrow: 'Real sessions',
      title: 'On the trail',
      accent: 'and below it',
      desc: 'Renaud’s proposal is my Path of the Gods story on the site. The others are nearby: Positano and Praiano lie below the trail, and Jassi’s proposal was on a villa terrace in Conca dei Marini.',
      slugs: ['renaud-path-of-the-gods', 'jassi-conca-proposal', 'ashley-positano', 'nick-family-praiano'],
      columns: 2,
    },
    faqs: [
      { q: 'How long is the Path of the Gods?', a: 'From Bomerano in Agerola to Nocelle above Positano it is roughly 7–8 km, and most walkers take around three hours one way. From Nocelle there is a long staircase down to Positano. For a photoshoot you don’t need to walk all of it: the viewpoint for Renaud’s proposal was about two kilometres from the start in Agerola.' },
      { q: 'What is the best time for a Path of the Gods photoshoot?', a: 'Late afternoon into golden hour. The light softens, the heat drops and the coastline below turns warm, which is when Renaud’s proposal portraits were made. Sunrise is possible too, but it means a very early start to reach Agerola. In July and August, avoid midday completely, because there is little shade on the trail.' },
      { q: 'Can you hide and photograph a surprise proposal on the trail?', a: 'Sometimes, but it is harder than at a villa or in town. We need a spot we have both seen, a clear landmark and a way for me to get there first. For Renaud it wasn’t realistic, so we walked together and recreated the proposal in several outfits. If a true surprise matters most, a villa terrace or a quiet corner of Atrani is easier.' },
      { q: 'How much does a Path of the Gods photoshoot cost?', a: 'The photography follows my standard couple packages: €250, €350 or €550 for 30, 60 or 120 minutes, covering both of you. Agerola isn’t in my published travel-zone table, so I quote the travel fee and confirm the session length when you send your date. Because the walk to the viewpoint takes time, you will usually want a longer session than in town.' },
      { q: 'What should we wear for photos on the Path of the Gods?', a: 'Hiking shoes for the walk, and something you love for the photographs, carried in a backpack. Renaud and his partner brought several changes of clothes, and strong colours such as red and blue stood out against the green slopes and the sea. Bring water, a hat and an extra layer for after sunset.' },
    ],
    service: {
      name: 'Path of the Gods photoshoots with Greg',
      serviceType: 'Proposal and couple photography on the Path of the Gods',
      areaServed: ['Path of the Gods', 'Agerola', 'Positano'],
      packages: couplePackages,
      priceNote: 'Base package price. Travel to Agerola is quoted on request.',
    },
    related: ['proposal-photographer', 'positano-photographer', 'couple-photoshoot', 'amalfi-photographer'],
  },

  // ───────────────────────────── PROPOSAL ─────────────────────────────
  {
    slug: 'proposal-photographer',
    group: 'occasion',
    nav: { label: 'Proposals', desc: 'A secret setup, then the yes', icon: 'ph-diamond' },
    title: 'Amalfi Coast Proposal Photographer: Secret Setups | Amalfi.Day',
    description: 'Planning a surprise proposal on the Amalfi Coast? How Greg stays hidden, photographs the question and the yes, then your portraits. Real proposals, prices.',
    hero: {
      slug: 'jassi-conca-proposal',
      alt: 'Jassi and his partner on a villa terrace above the sea in Conca dei Marini after his surprise proposal',
      eyebrow: 'Surprise proposal photography',
      lead: 'Amalfi Coast',
      accent: 'Proposal Photographer',
      intro: 'You plan the question. I’ll be hidden nearby, photograph every second, then stay for your first portraits as an engaged couple.',
    },
    answer: {
      title: 'How does a secret proposal photoshoot work?',
      paragraphs: [
        'You contact me privately, we choose the place and the moment together, and I get into position before your partner arrives. When you ask, I photograph the whole proposal in fast sequences, then we take relaxed portraits, the ring and the setting straight afterwards.',
        'I’m Greg, a photographer based in Atrani. Proposals are booked as couple sessions from €250, and your partner doesn’t need to know anything until the moment itself.',
      ],
    },
    facts: [
      { label: 'Booked as', value: 'A couple session, from €250' },
      { label: 'Planning', value: 'Privately, by WhatsApp or email' },
      { label: 'Settings so far', value: 'Villa terrace, mountain trail' },
      { label: 'Previews', value: '3–5 within 24 hours (60+ min)' },
      { label: 'Privacy', value: 'Exclusive Rights +€120' },
      { label: 'Rain', value: 'Free reschedule' },
    ],
    sections: [
      {
        eyebrow: 'Step by step',
        title: 'From the first message',
        accent: 'to the yes',
        steps: [
          { title: 'Message me privately', text: 'Use the form or WhatsApp and tell me the date, where you are staying and roughly what you imagine. All the planning happens between the two of us.' },
          { title: 'Choose the place and the moment', text: 'A villa terrace, a viewpoint or a quiet square. Jassi planned his around the couple’s day: on the terrace of the villa where they were staying, before they left for an excursion.' },
          { title: 'Work out how I get in unseen', text: 'For Jassi, the villa owner called me beforehand to explain when and how I could slip inside without being noticed, and I waited behind the farthest corner of the terrace.' },
          { title: 'The question', text: 'I photograph continuously, so nothing is missed: the table, the view, the moment you begin, the reaction. In Jassi’s set the frames follow one another so closely that together they almost move.' },
          { title: 'After the yes', text: 'We take a breath, then photograph the ring, the details and the two of you. Jassi and his partner had a little wine and relaxed before we carried on around the villa and its flowers.' },
        ],
      },
      {
        eyebrow: 'When hiding isn’t possible',
        title: 'A recreated proposal',
        accent: 'works too',
        paragraphs: [
          'Not every place allows a hidden photographer. On the Path of the Gods, Renaud and his partner had found a viewpoint two kilometres along the trail that I couldn’t have found alone, so we walked there together and recreated the proposal in a few outfits. The photographs are a shared retelling rather than a surprise, and the day became one of my biggest adventures of that summer.',
          'Other couples celebrate with an engagement session after the proposal. <a href="/photoshootings/regan-tay-ravello/">Taylor and Regan</a> photographed theirs among Ravello’s gardens in October, after Regan had proposed.',
        ],
      },
      {
        eyebrow: 'Tips',
        title: 'Small things',
        accent: 'that help',
        list: [
          '<strong>Pick a time before other plans.</strong> Like Jassi, ask before the day’s excursion, when your partner is relaxed and nobody is watching the clock.',
          '<strong>Involve the host.</strong> If you are staying in a villa or hotel, the owner or reception can help me arrive unseen, as Jassi’s villa owner did.',
          '<strong>Go early in the busy towns.</strong> In Atrani, Amalfi and Positano, sunrise means far fewer strangers in the background.',
          '<strong>Keep it private.</strong> With the Exclusive Rights add-on (+€120), your photographs won’t be used in my portfolio.',
          '<strong>Have a weather plan.</strong> If rain affects the shoot, rescheduling is free, which matters when the date means a lot.',
          '<strong>Book ahead in summer.</strong> From June to September, two to four weeks ahead gives you the best choice of dates.',
        ],
      },
    ],
    shoots: {
      eyebrow: 'Real proposals',
      title: 'Proposal & engagement',
      accent: 'stories',
      desc: 'A hidden-camera proposal on a villa terrace, a recreated proposal on a mountain trail and an engagement session in Ravello.',
      slugs: ['jassi-conca-proposal', 'renaud-path-of-the-gods', 'regan-tay-ravello'],
      columns: 3,
    },
    pricing: 'couple',
    pricingNote: 'A proposal is booked as a couple session. Every price covers both of you.',
    faqs: [
      { q: 'How do you stay hidden during a surprise proposal?', a: 'We plan it in advance. I arrive first and wait out of sight with a clear view, for example behind the farthest corner of a villa terrace, as I did for Jassi in Conca dei Marini. Where a host is involved, they can help me get in unseen. Your partner only notices me after the question, when the portraits begin.' },
      { q: 'How much does a proposal photographer cost on the Amalfi Coast?', a: 'With me, a proposal is booked as a couple session: €250 for 30 minutes, €350 for 60 or €550 for two hours, covering both of you. Atrani and Amalfi have no travel fee; Ravello adds €30 and Positano €70. You can add Exclusive Rights (+€120) if you would rather the photographs never appear in my portfolio.' },
      { q: 'Where is the best place to propose on the Amalfi Coast?', a: 'The best place is one where your partner feels at ease and I can stay hidden. A villa or hotel terrace with a sea view is the easiest for a true surprise. Ravello’s gardens are calm and romantic, Atrani is quiet at sunrise, and the Path of the Gods is spectacular but makes hiding difficult.' },
      { q: 'How long should a proposal photoshoot be?', a: 'The proposal itself takes a few minutes. The rest of the time goes on getting into position, the moment itself, then portraits, the ring and the setting once you have both calmed down. The 30-minute Mini covers a short surprise; the 60-minute Signature leaves room for relaxed portraits and an outfit change, and includes three preview photos within 24 hours.' },
      { q: 'Will we get some photos quickly to share the news?', a: 'Yes. The 60-minute Signature includes three preview photos within 24 hours and the two-hour Coastal Story includes five. For something faster, the Express Preview add-on gives you five lightly edited photos within 12 hours for €25. The full retouched set arrives in a private online gallery within 7 business days.' },
    ],
    service: {
      name: 'Amalfi Coast proposal photography with Greg',
      serviceType: 'Surprise proposal and engagement photography',
      areaServed: ['Amalfi Coast', 'Atrani', 'Amalfi', 'Ravello', 'Positano', 'Conca dei Marini'],
      packages: couplePackages,
      priceNote: 'Base price for two. Travel fees apply outside Atrani and Amalfi.',
    },
    related: ['couple-photoshoot', 'path-of-the-gods-photographer', 'ravello-photographer', 'amalfi-photographer'],
  },

  // ───────────────────────────── COUPLE ─────────────────────────────
  {
    slug: 'couple-photoshoot',
    group: 'occasion',
    nav: { label: 'Couples', desc: 'Honeymoons, anniversaries, post-wedding', icon: 'ph-heart' },
    title: 'Couple Photoshoot on the Amalfi Coast, from €250 | Amalfi.Day',
    description: 'Couple photoshoots on the Amalfi Coast with Greg: honeymoons, anniversaries, engagements and post-wedding sessions at sunrise in Atrani, Amalfi and Positano.',
    hero: {
      slug: 'nathalie-amalfi',
      alt: 'Nathalie and her companion beside a railing in warm morning light in Amalfi',
      eyebrow: 'Couple photoshoots with Greg',
      lead: 'Couple Photoshoot',
      accent: 'on the Amalfi Coast',
      intro: 'Honeymoons, anniversaries, engagements and post-wedding portraits. You enjoy the morning together; I’ll look after the light and the poses.',
    },
    answer: {
      title: 'What’s included in a couple photoshoot?',
      paragraphs: [
        'A couple photoshoot with me is a private session for the two of you, usually at sunrise in Atrani and Amalfi, with posing help throughout and professionally retouched photos in a private online gallery within 7 business days. There are three packages: €250 for 30 minutes, €350 for 60 and €550 for two hours across both towns, and each price covers both of you.',
        'Send a request from this page or on WhatsApp; a 30% deposit confirms the date.',
      ],
    },
    facts: [
      { label: 'Prices', value: '€250 / €350 / €550 for two' },
      { label: 'Retouched photos', value: '20+ / 60+ / 120+' },
      { label: 'Previews', value: '3 or 5 within 24 hours' },
      { label: 'Posing guide', value: 'Free, at poses.amalfi.day' },
      { label: 'Delivery', value: 'Within 7 business days' },
      { label: 'Languages', value: 'English, Italian, Russian' },
    ],
    sections: [
      {
        eyebrow: 'Kinds of sessions',
        title: 'One coast,',
        accent: 'many reasons',
        cards: [
          { icon: 'ph-heart', title: 'Honeymoons & anniversaries', text: 'The 60-minute Signature was made for these: two or three nearby spots, time for an outfit change and three previews within a day. Nathalie and her companion came from Finland for a few days in autumn, and our Amalfi morning ended at a café with my restaurant tips.' },
          { icon: 'ph-diamond', title: 'Engagements', text: 'Taylor and Regan celebrated Regan’s proposal with a session among Ravello’s gardens and old villas. For a surprise, see the proposal page.' },
          { icon: 'ph-sparkle', title: 'Post-wedding', text: 'Nilsa and her husband booked a couple of days ahead for a June morning from Amalfi harbour to Atrani. Takamasa and his partner brought their wedding dress from Japan, and the cars kept stopping to call “Auguri!”' },
          { icon: 'ph-camera-rotate', title: 'Styled & editorial', text: 'Tom and Sam from London planned a Ripley-inspired, sixties look well in advance. If you have a concept, bring it and I’ll build the route around it.' },
          { icon: 'ph-sun-horizon', title: 'Villa mornings', text: 'Anh and her boyfriend booked almost four months ahead for a morning at their villa in Conca dei Marini: coffee on the terrace, then a walk higher up the village.' },
        ],
      },
      {
        eyebrow: 'On the day',
        title: 'How a couple session',
        accent: 'unfolds',
        steps: [
          { title: 'Before we meet', text: 'We plan by WhatsApp or email: your style, the mood, the route. I share my free posing guide so you can save a few ideas.' },
          { title: 'Meeting', text: 'Usually a few minutes before sunrise, on the steps of Amalfi Cathedral or somewhere close to where you are staying.' },
          { title: 'The walk', text: 'Two or three spots on the Signature, four to six across Amalfi and Atrani on the Coastal Story. I guide hands, posture and where to look, and leave room for things to happen on their own.' },
          { title: 'Previews', text: 'With the 60 and 120-minute sessions, three or five preview photos arrive within 24 hours.' },
          { title: 'Your gallery', text: 'The full retouched set arrives in a private online gallery within 7 business days, with 90 days to download.' },
        ],
      },
      {
        eyebrow: 'Tips',
        title: 'What helps,',
        accent: 'from experience',
        paragraphs: [
          '<strong>Clothes.</strong> I usually suggest light, comfortable clothes that feel at home on the coast: airy linen shirts and dresses in colours so rich they almost seem too bright. Accessories help more than people expect; for Tom and Sam’s sixties look I insisted they bring plenty.',
          '<strong>Posing.</strong> Some couples need very little direction. With Ashley and her partner in Positano, I mostly followed what was happening. Others warm up slowly, and that’s fine. I fool around a little to bring out emotion, and I shoot in bursts so we can choose the frame where everything comes together.',
          '<strong>Preparation.</strong> Stephanie and her partner knew what they wanted to take home, which made the morning easy. A few saved poses or a couple of reference photos are plenty.',
        ],
      },
    ],
    shoots: {
      eyebrow: 'Real sessions',
      title: 'Couple',
      accent: 'stories',
      desc: 'Honeymoon-style mornings, an engagement, post-wedding portraits and one very well-dressed pair from London.',
      slugs: ['ashley-positano', 'stephanie-positano', 'nathalie-amalfi', 'nilsa-otanez-amalfi-atrani', 'takamasa-shigemi-amalfi-atrani', 'esmeralda-cortez-amalfi', 'tom-sam-atrani', 'anh-hoang-conca-dei-marini', 'regan-tay-ravello'],
      columns: 3,
    },
    pricing: 'couple',
    pricingNote: 'Every price below covers both of you.',
    faqs: [
      { q: 'How much does a couple photoshoot on the Amalfi Coast cost?', a: 'With me, couple sessions are €250 for 30 minutes (20+ photos), €350 for 60 minutes (60+ photos) and €550 for two hours across Amalfi and Atrani (120+ photos). Prices cover both of you. Atrani and Amalfi have no travel fee; other towns add a travel fee from €30 to €150 (plus transport for Capri, Naples and Pompeii). Extra time is €200 per hour for couples.' },
      { q: 'Do we need any posing experience?', a: 'No. I guide you throughout, from where to put your hands to small changes in posture and where you look, and I keep things light so the expressions are real. Before we meet I share my free posing guide at poses.amalfi.day. You can bookmark a few ideas, but there is nothing to memorise.' },
      { q: 'What should couples wear for an Amalfi Coast photoshoot?', a: 'Light, comfortable clothes that suit the coast work best: linen shirts, flowing dresses and strong colours that hold up against the sea and pastel walls. Wear shoes you can manage steps in and carry dressier ones if you like. If you have a concept, like Tom and Sam’s sixties look, plan it and bring accessories.' },
      { q: 'Can we include a few photos of each of us alone?', a: 'Yes, and it is easy to plan. During Anh’s villa morning in Conca dei Marini we made individual portraits and couple photographs on the same balcony before walking higher into the village. Tell me beforehand how many solo portraits you would like, so we leave time for them within your session.' },
      { q: 'Does a couple photoshoot have to be at sunrise?', a: 'No, but I recommend it. At sunrise Amalfi and Atrani are nearly empty and the light stays soft for longer. Later, bright sun gives a hot, summery look that can be lovely, but the streets fill up. Ravello is the exception: its gardens stay calm, and the late afternoon there works well.' },
    ],
    service: {
      name: 'Amalfi Coast couple photoshoots with Greg',
      serviceType: 'Couple, honeymoon, anniversary and post-wedding photography',
      areaServed: ['Amalfi Coast', 'Atrani', 'Amalfi', 'Ravello', 'Positano'],
      packages: couplePackages,
      priceNote: 'Base price for two. Travel fees apply outside Atrani and Amalfi.',
    },
    related: ['proposal-photographer', 'amalfi-photographer', 'positano-photographer', 'family-photoshoot'],
  },

  // ───────────────────────────── FAMILY ─────────────────────────────
  {
    slug: 'family-photoshoot',
    group: 'occasion',
    nav: { label: 'Families', desc: 'Children welcome, €30 per extra person', icon: 'ph-users-three' },
    title: 'Amalfi Coast Family Photoshoot: Prices & Tips | Amalfi.Day',
    description: 'Family photoshoots on the Amalfi Coast with Greg: relaxed mornings with children in Praiano, Positano, Amalfi and Atrani, with prices per person and tips.',
    hero: {
      slug: 'sally-rose-family-positano',
      alt: 'Sally and Rose’s whole family together on the beach beneath Positano',
      eyebrow: 'Family photoshoots with Greg',
      lead: 'Family Photoshoot',
      accent: 'on the Amalfi Coast',
      intro: 'Children, grandparents, the whole car. A morning walk with a photographer who doesn’t mind an ice-cream stop.',
    },
    answer: {
      title: 'How does a family photoshoot work?',
      paragraphs: [
        'A family photoshoot is one of my couple packages with extra people added: the package covers two, and each additional person is €30. We meet early, walk at the children’s pace through a village or along the beach, and mix group photographs with the small moments in between.',
        'I’m Greg, a photographer based in Atrani. Send your date, the number of people and where you are staying, and we’ll choose a meeting point the whole family can reach easily.',
      ],
    },
    facts: [
      { label: 'Price', value: 'Couple package + €30 per extra person' },
      { label: 'Example', value: 'Family of four, 60 min: €410' },
      { label: 'Best time', value: 'Early morning' },
      { label: 'Stories here', value: 'Praiano, Positano' },
      { label: 'Prints', value: '10 archival prints +€50' },
      { label: 'Rain', value: 'Free reschedule' },
    ],
    sections: [
      {
        eyebrow: 'Two families',
        title: 'What a family morning',
        accent: 'looks like',
        paragraphs: [
          'Nick’s family met me very early in Praiano on 23 May. They were staying near the main road and had a climb to reach our meeting point, so golden hour was nearly over by the time they arrived, but everyone was in a wonderful mood. The children were curious, cheerful and unbothered by the early start. We walked from the main street and its open views towards the church, then into lanes full of flowers.',
          'The best part came after the session had officially finished. We stopped at a fruit shop, the children had ice cream and some fruit, and a little further on we found a view towards Positano. Of course I took a few more photographs.',
          'Sally and Rose’s family have photographs taken every year, each time somewhere different. They had rented a villa in Praiano and met me at a car park in Positano, arriving in one very large car. Getting everyone ready meant we missed golden hour, yet there was still good light and room on the beach, and the hour we had planned became two.',
        ],
      },
      {
        eyebrow: 'Planning',
        title: 'Tips for',
        accent: 'photographing a family',
        list: [
          '<strong>Choose an easy meeting point.</strong> A car park, a hotel entrance or a spot on the main road saves a steep walk with small children before we even start.',
          '<strong>Be realistic about timing.</strong> A group takes longer to get out of the door than a couple. Aim for sunrise and expect to begin a little later.',
          '<strong>Plan a break.</strong> A snack or an ice cream resets everyone, and some of the nicest family frames happen during it.',
          '<strong>List the groupings.</strong> Grandparents with grandchildren, siblings, each couple. Two hours gave Sally and Rose’s family time for every combination of people.',
          '<strong>Say what the photos are for.</strong> If one is going to be printed large for the wall, tell me. For Sally and Rose’s family I spent extra time on the retouching while keeping everyone looking like themselves.',
        ],
      },
      {
        eyebrow: 'Where',
        title: 'Good places',
        accent: 'for families',
        paragraphs: [
          'Praiano is calm, full of flowers in spring, with a church square and open views, and it suits families staying in villas along that stretch. Positano gives you the famous beach backdrop but is busier and has many steps. Both are in travel zone 3: +€70, with a 90-minute minimum.',
          'Atrani and Amalfi are my base, with no travel fee. In Atrani the square, the beach and the staircases are all close together, so small legs don’t have far to go. See <a href="/photoshootings/amalfi-photographer/">photoshoots in Amalfi and Atrani</a> or <a href="/photoshootings/positano-photographer/">in Positano</a>.',
        ],
      },
    ],
    shoots: {
      eyebrow: 'Real sessions',
      title: 'Family',
      accent: 'stories',
      desc: 'A May morning with Nick’s family in Praiano and a two-hour session with Sally and Rose’s family in Positano.',
      slugs: ['nick-family-praiano', 'sally-rose-family-positano'],
      columns: 2,
    },
    pricing: 'couple',
    pricingNote: 'Family sessions start from these couple packages, which cover two people. Each additional person is €30.',
    faqs: [
      { q: 'How much does a family photoshoot on the Amalfi Coast cost?', a: 'Family sessions use my couple packages, which cover two people, plus €30 for each additional person. A family of four for 60 minutes is €350 plus 2 × €30, so €410, before any travel fee. Praiano and Positano add €70 and have a 90-minute minimum; Atrani and Amalfi have no travel fee.' },
      { q: 'What is the best time for a family photoshoot with children?', a: 'Early morning. It is cooler, the streets are quiet and there is room for children to move around. Nick’s children were cheerful from the start despite the early meeting. If sunrise is unrealistic for your family, a slightly later start still works: Sally and Rose’s family arrived after golden hour and we still had lovely light.' },
      { q: 'How long should a family photoshoot be?', a: 'Allow at least 60 minutes for a family group, because arranging several people takes time and children need breaks. In Positano and Praiano the minimum is 90 minutes anyway. Sally and Rose’s family planned one hour and it became two, which gave us time for every grouping they wanted.' },
      { q: 'Can grandparents or friends join the session?', a: 'Yes. Any third or further guest is €30 per person on top of a couple package. Sally and Rose arrived with a whole car full of relatives. Tell me the number of people and any special groupings when you send your request, so we can plan the route and the timing around them.' },
      { q: 'Can we print our family photos?', a: 'Yes. You receive full-resolution JPEGs, ready for prints, and you can add a set of 10 archival 13×18 cm prints for €50. If you have one image in mind for a large frame, tell me; for Sally and Rose’s family I took extra care over the retouching while keeping the people and the feeling of the morning true to life.' },
    ],
    service: {
      name: 'Amalfi Coast family photoshoots with Greg',
      serviceType: 'Family photography',
      areaServed: ['Amalfi Coast', 'Praiano', 'Positano', 'Atrani', 'Amalfi'],
      packages: couplePackages,
      priceNote: 'Base price for two people; each additional person is €30. Travel fees apply outside Atrani and Amalfi.',
    },
    related: ['positano-photographer', 'couple-photoshoot', 'amalfi-photographer', 'solo-photoshoot'],
  },

  // ───────────────────────────── SOLO ─────────────────────────────
  {
    slug: 'solo-photoshoot',
    group: 'occasion',
    nav: { label: 'Solo', desc: 'Birthdays, first shoots, creators', icon: 'ph-user' },
    title: 'Solo Photoshoot on the Amalfi Coast, from €200 | Amalfi.Day',
    description: 'Solo photoshoots on the Amalfi Coast with Greg: birthday gifts to yourself, first-time portraits and creator content at sunrise in Amalfi, Atrani and Ravello.',
    hero: {
      slug: 'hinad-amalfi-sunrise',
      alt: 'Hinad on the shore at sunrise, with the sun rising behind her and the mountains',
      eyebrow: 'Solo travel & portrait photoshoots',
      lead: 'Solo Photoshoot',
      accent: 'on the Amalfi Coast',
      intro: 'Travelling alone is no reason to go home without photographs of yourself. Bring a dress; I’ll bring the route and the poses.',
    },
    answer: {
      title: 'What is a solo photoshoot on the Amalfi Coast?',
      paragraphs: [
        'A solo photoshoot is a private portrait session for one person. I take you through quiet streets and viewpoints, usually at sunrise in Atrani and Amalfi, and guide your poses the whole time.',
        'I’m Greg, a photographer based in Atrani. Sessions are €200 for 30 minutes, €300 for 60 or €480 for two hours, with professionally retouched photos delivered within 7 business days. Book through the form on this page, on WhatsApp or on GetYourGuide.',
      ],
    },
    facts: [
      { label: 'Prices', value: '€200 / €300 / €480' },
      { label: 'Retouched photos', value: '20+ / 60+ / 120+' },
      { label: 'Outfits', value: 'One, one change, two changes' },
      { label: 'Previews', value: '3 or 5 within 24 hours' },
      { label: 'Extra hour', value: '€180' },
      { label: 'Languages', value: 'English, Italian, Russian' },
    ],
    sections: [
      {
        eyebrow: 'Why people book',
        title: 'A gift, a first time,',
        accent: 'a portfolio',
        cards: [
          { icon: 'ph-gift', title: 'A birthday gift to yourself', text: 'Loreana was visiting Italy from Peru, left her friends in Rome for a couple of days and messaged me on a Sunday morning. It became, in her words, “the best birthday gift I could give to myself this year.” Lashanda booked her birthday sunrise in Atrani as a gift to herself too.' },
          { icon: 'ph-user', title: 'Your first photoshoot', text: 'Jatin had never had one. At first he kept watching the camera; after a short break for a drink he laughed more and stopped thinking about it. You don’t need experience, only a little time to feel comfortable.' },
          { icon: 'ph-camera', title: 'Content & personal brand', text: 'Shifa’s sunrise session in Amalfi was planned for content: the cathedral steps, clean backgrounds and the freedom to move between the pier, the sand and the shoreline before anyone else arrived.' },
          { icon: 'ph-heart', title: 'A gift from a friend', text: 'Julietta gave a sunset session in Maiori to her friend, so most of the photos feature her, with a few of the two of them together at the end.' },
          { icon: 'ph-sparkle', title: 'A model portfolio', text: 'Ayuna came to Atrani to build her portfolio. We mixed casual and elegant looks and tried different lenses in the village lanes.' },
        ],
      },
      {
        eyebrow: 'Choosing a package',
        title: 'How much time',
        accent: 'you need',
        paragraphs: [
          'The 30-minute Mini (€200) gives you 20+ photos in one compact area with one outfit, enough for a few favourite portraits from your trip. The 60-minute Signature (€300) is the one I recommend: two or three spots, time for one outfit change, 60+ photos and three previews within 24 hours.',
          'The two-hour Coastal Story (€480) covers four to six spots across Amalfi and Atrani, with two outfit changes and 120+ photos. It suits creators, personal portfolios and anyone who wants a full travel story.',
        ],
      },
      {
        eyebrow: 'Tips',
        title: 'Feeling at ease',
        accent: 'on your own',
        list: [
          '<strong>You won’t be posing in a crowd.</strong> At sunrise the streets are nearly empty, which makes it much easier to relax.',
          '<strong>Bring something bright.</strong> A colourful dress against the water, with the first light on the buildings, as in Hinad’s session, gives me a lot to work with.',
          '<strong>Last-minute is sometimes possible.</strong> Hinad changed her plans the evening before; Loreana asked for a shoot within a few hours. In high season, booking two to four weeks ahead is safer.',
          '<strong>Someone can come along.</strong> Lashanda’s sister came to her session and helped as an improvised stylist.',
          '<strong>Outside the base towns.</strong> I’ve also photographed solo sessions in Ravello, Maiori, Tramonti and Sorrento, where <a href="/photoshootings/jatin-sorrento/">Jatin’s</a> took place at his hotel.',
        ],
      },
    ],
    shoots: {
      eyebrow: 'Real sessions',
      title: 'Solo',
      accent: 'stories',
      desc: 'Birthday sunrises, a first-ever photoshoot, creator content and a fashion story.',
      slugs: ['hinad-amalfi-sunrise', 'loreana', 'lashada', 'shifa', 'jatin-sorrento', 'julietta', 'ayuna', 'ravello-photoshooting'],
      columns: 4,
    },
    pricing: 'solo',
    pricingNote: 'A few favourite portraits or a whole coastal story.',
    faqs: [
      { q: 'How much does a solo photoshoot on the Amalfi Coast cost?', a: 'Solo sessions with me are €200 for 30 minutes with 20+ retouched photos, €300 for 60 minutes with 60+ photos and three previews within 24 hours, or €480 for two hours across Amalfi and Atrani with 120+ photos. There is no travel fee in Atrani and Amalfi; Ravello adds €30. Extra time is €180 per hour.' },
      { q: 'I’ve never posed before. Will I look awkward?', a: 'The first few minutes can feel strange, and then it passes. I guide your hands, posture and where you look, and we take short breaks when needed. For Jatin, at his first photoshoot, a pause for a drink changed everything. You can also look through my free posing guide at poses.amalfi.day before we meet.' },
      { q: 'Is a solo photoshoot a good gift?', a: 'Yes, for yourself or someone else. Loreana and Lashanda both booked theirs as birthday gifts to themselves, and Julietta gave a sunset session in Maiori to her friend. A photoshoot gives you an experience during the trip and professional photographs that stay with you for years. Send a request with the travel dates and who the session is for.' },
      { q: 'Can I change outfits during a solo photoshoot?', a: 'Yes. The 60-minute Signature has time for one outfit change and the two-hour Coastal Story for two. The 30-minute Mini is planned around one outfit. Bring the second look in a small bag and tell me beforehand, so we can plan the change into the route without losing the best light.' },
      { q: 'Can you take photos for Instagram or a personal brand?', a: 'Yes. I photograph content creators as well as travellers, usually at sunrise, when places like Amalfi harbour and the cathedral steps are empty. Shifa’s session is a good example. You can use the photographs freely for personal purposes; commercial use is arranged separately, and exclusive rights are available as an add-on.' },
    ],
    service: {
      name: 'Amalfi Coast solo photoshoots with Greg',
      serviceType: 'Solo travel, portrait and personal-brand photography',
      areaServed: ['Amalfi Coast', 'Atrani', 'Amalfi', 'Ravello'],
      packages: soloPackages,
      priceNote: 'Base price for one person. Travel fees apply outside Atrani and Amalfi.',
    },
    related: ['amalfi-photographer', 'ravello-photographer', 'couple-photoshoot', 'proposal-photographer'],
  },
]

export const getLandingPage = (slug: LandingSlug) => {
  const page = landingPages.find(item => item.slug === slug)
  if (!page) throw new Error(`Unknown photoshoot landing page: ${slug}`)
  return page
}

export const landingGroups = [
  { id: 'location', label: 'By location', pages: landingPages.filter(page => page.group === 'location') },
  { id: 'occasion', label: 'By occasion', pages: landingPages.filter(page => page.group === 'occasion') },
] as const
