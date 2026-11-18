import type { LandingPage } from '../photoshoot-landings'

// Sorrento has one published story (Jatin). Everything here comes from that story,
// the travel zones on /photoshootings/ and the package prices in src/data/photographer.ts.
const page = {
  slug: 'sorrento-photographer',
  group: 'location',
  nav: { label: 'Sorrento', desc: 'A hotel terrace portrait session', icon: 'ph-buildings' },
  title: 'Sorrento Photographer for Solo Portraits | Amalfi.Day',
  description: 'Solo portrait photoshoots in Sorrento with Greg, based in Atrani: a hotel and sea-view terrace session, honest advice, a €100 travel fee and clear prices.',
  hero: {
    slug: 'jatin-sorrento',
    alt: 'A wide portrait of Jatin on a hotel terrace above the sea and the rooftops of Sorrento',
    eyebrow: 'Solo portraits in Sorrento',
    lead: 'Sorrento',
    accent: 'Photographer',
    intro: 'Short on time in Sorrento? I’ll come to your hotel. Jatin’s first photoshoot used his hotel lounge and its sea-view terraces at sunset.',
  },
  answer: {
    title: 'Can you photograph me in Sorrento?',
    paragraphs: [
      'Yes. I’m Greg (Gregory), a photographer based in Atrani, and I travel to Sorrento for solo portrait sessions. My one published Sorrento story is Jatin’s first-ever photoshoot, made at his hotel and on its sea-view terraces, because he had little time and could not travel to Amalfi to meet me.',
      'Sorrento is travel zone 4: standard package prices plus a €100 travel fee, with a 90-minute minimum, so the two-hour Coastal Story (€480 solo) becomes €580 in total. Travel time is not deducted from your session. Send your date and where you are staying through the form on this page or on WhatsApp, and I’ll reply personally.',
    ],
  },
  facts: [
    { label: 'Travel fee', value: '+€100 (zone 4)' },
    { label: 'Minimum session', value: '90 minutes' },
    { label: 'Two hours, solo', value: '€480 + €100 = €580' },
    { label: 'Story here', value: 'Jatin’s hotel session' },
    { label: 'Delivery', value: 'Within 7 business days' },
    { label: 'Languages', value: 'English, Italian, Russian' },
  ],
  sections: [
    {
      eyebrow: 'Jatin’s story',
      title: 'Why we met',
      accent: 'at a hotel',
      paragraphs: [
        'I usually suggest meeting in Amalfi, but Jatin had little time and could not make the journey. He was happy to wait for me in Sorrento, so we photographed him at his hotel, away from the busy streets.',
        'It turned out to be a place full of backgrounds. In the lounge there were mirrors, paintings, ceramics, a wooden table and beautiful chairs, and outside there were sea-view terraces with white railings, large terracotta planters and the rooftops below. We could have spent the whole session in there without running out of places to photograph.',
        'Because he had never had a photoshoot, he kept noticing the camera at first and wondering how to pose. We took a short break for a drink, and something shifted: he laughed more, his expression softened and he stopped following the lens. By the time we reached the terraces, with the sun going down over the sea, it felt like a different session.',
      ],
    },
    {
      eyebrow: 'What I took from it',
      title: 'What worked',
      accent: 'in Sorrento',
      cards: [
        { icon: 'ph-buildings', title: 'A hotel is a location', text: 'Jatin’s hotel gave us a lounge with mirrors, paintings and ceramics, plus terraces over the sea. If you are staying somewhere with character, we can plan the session around it rather than around the busy streets.' },
        { icon: 'ph-sun-horizon', title: 'The terraces at sunset', text: 'The last part of Jatin’s session was on the sea-view terraces as the sun set, with silhouettes against the orange sky as well as portraits in hats and a navy shirt.' },
        { icon: 'ph-coffee', title: 'A pause helps', text: 'A drink halfway through changed the whole mood for a first-timer. I plan breaks into longer sessions, and I have a free posing guide at poses.amalfi.day if you want ideas before we meet.' },
      ],
    },
    {
      eyebrow: 'Practical',
      title: 'Planning a Sorrento session',
      accent: 'with me',
      list: [
        '<strong>Honest expectations.</strong> Jatin’s is my one published Sorrento story. I know the coast between Atrani and Positano far better, so I will plan Sorrento with you rather than pretend to have a long list of favourite spots.',
        '<strong>Why 90 minutes.</strong> Sorrento is in travel zone 4, which has a 90-minute minimum because I travel from Atrani. Travel time is not deducted from your session. For one person the two-hour Coastal Story is the natural choice.',
        '<strong>Meeting point.</strong> We agree it in advance. For Jatin it was his hotel. If you are staying somewhere you like, tell me its name and what it looks like when you send your request.',
        '<strong>Prefer Amalfi?</strong> My base is Atrani and Amalfi, with no travel fee. <a href="/ferry-timetables/">The seasonal NLG boat links Sorrento and Amalfi</a>, if you would rather come to me. See <a href="/photoshootings/amalfi-photographer/">photoshoots in Amalfi and Atrani</a>.',
        '<strong>Heading to Positano as well?</strong> It is a different travel zone and a different kind of session: <a href="/photoshootings/positano-photographer/">see Positano</a>.',
      ],
    },
  ],
  shoots: {
    eyebrow: 'Real sessions',
    title: 'Photoshoots in',
    accent: 'Sorrento',
    desc: 'Jatin’s hotel session is my one published Sorrento story. The other two are solo sessions from elsewhere on the coast, not Sorrento, shown so you can see how I work with one person.',
    slugs: ['jatin-sorrento', 'loreana', 'hinad-amalfi-sunrise'],
    columns: 3,
  },
  faqs: [
    { q: 'How much does a photoshoot in Sorrento cost?', a: 'Sorrento is travel zone 4, so you pay my standard package price plus a €100 travel fee. The minimum session there is 90 minutes, which makes the two-hour Coastal Story the fit for one person: €480 plus €100, so €580 in total, with 120+ retouched photos. A 30 or 60-minute session is not available in Sorrento. A 30% deposit confirms the date.' },
    { q: 'Where would we photograph in Sorrento?', a: 'It depends on where you are staying and what you like. Jatin’s session, my one published Sorrento story, took place at his hotel: a lounge with mirrors, paintings and ceramics, then sea-view terraces at sunset. I’d rather plan the places with you than promise a list of spots I have not photographed.' },
    { q: 'I have never had a photoshoot. Is that a problem?', a: 'No. Jatin’s Sorrento session was his first, and he kept noticing the camera at the start. A short break for a drink changed everything: he laughed more and stopped following the lens. I guide your hands, posture and where you look, and you can see my free posing guide at poses.amalfi.day before we meet.' },
    { q: 'Do you photograph couples or groups in Sorrento?', a: 'My Sorrento story is a solo portrait session, but the same travel fee and 90-minute minimum apply to couple sessions. A two-hour couple session is €550 plus €100. Send your date, the number of people and where you are staying, and I will confirm what is possible.' },
    { q: 'Can I meet you in Amalfi instead?', a: 'Yes, and that is what I usually suggest. Atrani and Amalfi are my base: no travel fee and no minimum beyond the package you choose. NLG runs a seasonal boat between Sorrento and Amalfi, so check the timetable on my ferry page for your dates. Jatin could not make that journey, which is why I came to him.' },
  ],
  service: {
    name: 'Sorrento photoshoots with Greg',
    serviceType: 'Solo portrait photography in Sorrento',
    areaServed: ['Sorrento'],
    packages: ['coastal'],
    priceNote: 'Base package price. Sorrento sessions add a €100 travel fee (zone 4) and have a 90-minute minimum.',
  },
  related: ['solo-photoshoot', 'amalfi-photographer', 'positano-photographer', 'couple-photoshoot'],
} satisfies LandingPage

export default page
