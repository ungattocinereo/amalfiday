import type { LandingPage } from '../photoshoot-landings'

// Maiori has one published story (Julietta). Minori is named only as the next town in the
// same travel zone: there are no Minori shoots. Facts come from the story, the travel zones,
// src/data/photographer.ts, /beaches/ and /ferry-timetables/.
const page = {
  slug: 'maiori-photographer',
  group: 'location',
  nav: { label: 'Maiori & Minori', desc: 'Sunset by the longest beach on the coast', icon: 'ph-sun-horizon' },
  title: 'Maiori Photographer: Sunset Photoshoots | Amalfi.Day',
  description: 'Maiori photoshoots with Greg, based in Atrani: a sunset session of town streets and seafront, plus Minori next door. €30 travel fee, halved for 2 hours.',
  hero: {
    slug: 'julietta',
    alt: 'Julietta in golden evening light during a sunset photoshoot in Maiori',
    eyebrow: 'Sunset photoshoots in Maiori',
    lead: 'Maiori',
    accent: 'Photographer',
    intro: 'A sunset session in the town with the longest beach on the Amalfi Coast. I have published one Maiori session so far, and this is what it was like.',
  },
  answer: {
    title: 'What is a photoshoot in Maiori like?',
    paragraphs: [
      'I’m Greg (Gregory), a photographer based in Atrani, and I photograph travellers and friends in Maiori at sunset. My published Maiori story is Julietta’s, from July 2024: an evening walk through town, along the seafront and into the last light behind the mountains, a gift between two friends. Minori, the next town along, is in the same travel zone, though I have no Minori story to show you yet.',
      'Maiori and Minori are travel zone 1: standard package prices plus a €30 travel fee, halved to €15 when you book 120 minutes or more. Any package can be booked here. Send your date through the form on this page or on WhatsApp, and I’ll reply personally.',
    ],
  },
  facts: [
    { label: 'Travel fee', value: '+€30 (zone 1)' },
    { label: '120+ minutes', value: 'Travel fee halved to €15' },
    { label: 'Best light', value: 'Sunset' },
    { label: 'Next town', value: 'Minori, same zone' },
    { label: 'Story here', value: 'One: Julietta, July 2024' },
    { label: 'From Amalfi', value: 'About 15 min by Travelmar ferry' },
  ],
  sections: [
    {
      eyebrow: 'Julietta’s evening',
      title: 'A sunset',
      accent: 'that became a gift',
      paragraphs: [
        'On 20 July 2024, in Maiori, the atmosphere was light, natural and full of real emotions. The session was a gift between two friends, which is why most of the photographs are of one of them. At the end we also made photographs of the two of them together, to keep the feeling of their trip and their friendship.',
        'It was a story about two friends travelling along the Amalfi Coast: walking through the town, talking, laughing at simple things and feeling time slow down. Sessions like this feel authentic because people are simply living their moment while I photograph it.',
        'Only one story from Maiori is on the site so far. I’d rather show you that honestly than fill the page with places I haven’t photographed.',
      ],
    },
    {
      eyebrow: 'What we photographed',
      title: 'Streets, seafront',
      accent: 'and the last light',
      cards: [
        { icon: 'ph-map-pin', title: 'Evening streets', text: 'The story opens with an evening walk through Maiori’s streets: talking, laughing at simple things and letting time slow down.' },
        { icon: 'ph-waves', title: 'The seafront at dusk', text: 'Warm sunset light on the promenade, and a quiet moment by the sea at dusk. Maiori has the longest beach on the Amalfi Coast, so there is a lot of open shoreline to work with.' },
        { icon: 'ph-sun', title: 'Backlight behind the mountains', text: 'In the last rays the sun disappeared behind the mountains and gave strong backlight, so strong that we kept shooting without stopping. It produced silhouettes and glowing portraits.' },
        { icon: 'ph-sparkle', title: 'An unplanned guest', text: 'A random dog ran straight into the shoot for some attention and became part of that evening’s story. You can’t plan moments like that, but they are what make a session feel alive.' },
      ],
    },
    {
      eyebrow: 'Practical',
      title: 'Planning Maiori,',
      accent: 'Minori and beyond',
      list: [
        '<strong>Travel fee.</strong> Maiori and Minori are travel zone 1: +€30, halved to €15 with a session of 120 minutes or more. Travel time is not deducted from your session. With the fee, a 60-minute solo Signature is €330 and a two-hour solo Coastal Story is €495; a two-hour couple Coastal Story is €565 (€550 + €15).',
        '<strong>Getting there.</strong> Travelmar ferries run seasonally between Amalfi and Maiori in about 15 minutes (€5), and SITA bus line 5120 links Amalfi, Atrani, Minori and Maiori. Check <a href="/ferry-timetables/">the ferry timetables</a> for your date.',
        '<strong>Minori next door.</strong> It is in the same zone and has the same fee. Its beach is smaller and softer than Maiori’s, and fills up quickly in peak season. I haven’t published a shoot there, so we would plan it together.',
        '<strong>Up in the valley.</strong> Tramonti, the valley above Maiori, is travel zone 2 (+€50). I photographed <a href="/photoshootings/camelia/">Camelia there on my motorbike</a>, and the <a href="/moto/">Tramonti moto route</a> ends at Minori.',
        '<strong>A gift.</strong> Julietta’s session was a present between friends. It gives an experience, emotions and professional photos that stay with you for years.',
        '<strong>Prefer my home towns?</strong> Atrani and Amalfi have no travel fee: <a href="/photoshootings/amalfi-photographer/">see Amalfi and Atrani</a>.',
      ],
    },
  ],
  shoots: {
    eyebrow: 'Real sessions',
    title: 'Photoshoots in',
    accent: 'Maiori & nearby',
    desc: 'Julietta’s sunset is my one published Maiori story. Camelia’s motorbike session was in Tramonti, the valley above it (zone 2).',
    slugs: ['julietta', 'camelia'],
    columns: 2,
  },
  pricing: 'solo',
  pricingNote: 'Base prices for one person. Maiori and Minori add a €30 travel fee, halved for 120+ minutes. Couple packages are on the couples page.',
  faqs: [
    { q: 'How much does a photoshoot in Maiori cost?', a: 'Maiori is travel zone 1, so you pay my standard package price plus a €30 travel fee, halved to €15 when you book 120 minutes or more. For one person that is €230 for 30 minutes, €330 for 60 and €495 for two hours including the discounted fee. For a couple, two hours is €565. A 30% deposit confirms the date.' },
    { q: 'What time is best for a photoshoot in Maiori?', a: 'Sunset. Julietta’s session was an evening one in July: soft warm light on the town and seafront, then strong backlight as the sun dropped behind the mountains. Tell me your dates and I will confirm the sunset time for your day so we can start in good time.' },
    { q: 'Do you photograph in Minori too?', a: 'Yes, Minori is in the same travel zone as Maiori, with the same €30 fee. I should be honest that my published story is from Maiori only, not Minori. Its beach is smaller than Maiori’s and fills up quickly in peak season, so we would choose the timing and the spots together.' },
    { q: 'How do I get to Maiori from Amalfi?', a: 'Travelmar ferries sail between Amalfi and Maiori in about 15 minutes for €5 in the season, and SITA bus line 5120 runs through Atrani, Minori and Maiori. The ferry timetable is on my ferry page. If you are staying in Atrani or Amalfi, I can also meet you at your hotel or at the harbour.' },
    { q: 'Can a Maiori photoshoot be a gift?', a: 'Yes, that is exactly what Julietta’s was: a gift between two friends. Most of the photographs are of one of them, and we finished with a few of the two together. Tell me the travel dates and who the session is for, and I will plan the length and the time of day.' },
    { q: 'Do you photograph couples and groups in Maiori?', a: 'Yes. Couple packages cover two people and are €250, €350 and €550 for 30, 60 and 120 minutes, plus the €30 zone 1 travel fee. My only Maiori story is a solo session with a friend at the end, so tell me what you have in mind and I will confirm what works for your date.' },
  ],
  service: {
    name: 'Maiori photoshoots with Greg',
    serviceType: 'Sunset, solo, couple and gift photography in Maiori and Minori',
    areaServed: ['Maiori', 'Minori'],
    packages: ['portrait', 'soloSignature', 'coastal', 'coupleMini', 'golden', 'panorama'],
    priceNote: 'Base package price. Maiori and Minori sessions add a €30 travel fee (zone 1), halved for sessions of 120 minutes or more.',
  },
  related: ['ravello-photographer', 'amalfi-photographer', 'solo-photoshoot', 'couple-photoshoot'],
} satisfies LandingPage

export default page
