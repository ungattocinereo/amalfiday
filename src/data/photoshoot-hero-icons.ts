export type PhotoshootHeroIcon = { name: string, label: string }
type IconRule = PhotoshootHeroIcon & { match: RegExp }

// Three complementary details: the session, its occasion/light, and its setting.
// Specific subjects take priority over generic words such as "portrait" or "coast".
const session: IconRule[] = [
  { match: /\b(family|families|maternity|newborn|siblings)\b|семейн|беремен|новорожд/i, name: 'ph-users-three', label: 'Family story' },
  { match: /\b(couples?(?!\s+of\b)|engagement|proposal|wedding|honeymoon|anniversary|love stor(?:y|ies))\b|парная|помолв|свадьб|годовщин/i, name: 'ph-heart', label: 'A story for two' },
  { match: /\b(influencer|fashion|editorial|portfolio|model)\b|модная|модель|портфолио/i, name: 'ph-camera', label: 'Editorial photography' },
  { match: /\b(solo|individual|portraits?|alone)\b|индивидуальн|портрет/i, name: 'ph-user', label: 'Portrait story' },
]
const occasion: IconRule[] = [
  { match: /\b(engagement|proposal|wedding|honeymoon)\b|помолв|свадьб|медовый месяц/i, name: 'ph-diamond', label: 'A new chapter together' },
  { match: /\b(birthday|gifts?|celebration)\b|день рождения|подар|праздник/i, name: 'ph-gift', label: 'A gift to remember' },
  { match: /\b(night|moonlight|after dark)\b|ночн|лунн/i, name: 'ph-moon', label: 'After dark' },
  { match: /\b(sunrise|sunset|dawn|golden hour|morning|sunlight|sun|afternoon)\b|рассвет|закат|утрен|солнеч/i, name: 'ph-sun', label: 'Natural light' },
  { match: /\b(travel|trip|journey|explor(?:e|ing|ation)|adventure)\b|путешеств|прогулк/i, name: 'ph-compass', label: 'A journey to remember' },
]
const setting: IconRule[] = [
  { match: /\b(path of the gods|mountain trail|hiking|hikers|trekking)\b/i, name: 'ph-mountains', label: 'In the mountains' },
  { match: /\b(motorbike|motorcycle|scooter|vespa)\b|мотоцикл|скутер/i, name: 'ph-motorcycle', label: 'On the open road' },
  { match: /\b(harbou?r|pier|boat|sailing|yacht)\b|гаван|причал|яхт|лодк/i, name: 'ph-anchor', label: 'By the harbour' },
  { match: /\b(gardens?|vineyards?|forest|woods|flowers?)\b|сад[ыу]|виноград|лесу|цветы/i, name: 'ph-leaf', label: 'Surrounded by nature' },
  { match: /\b(coast(?:al|line)?|sea|beach|shore(?:line)?|mediterranean)\b|побереж|мор[ея]|пляж/i, name: 'ph-waves', label: 'By the coast' },
  { match: /\b(mountains?|hills?|cliffs?|valley)\b|гор[ыа]|скал|долин/i, name: 'ph-mountains', label: 'Above the landscape' },
  { match: /\b(village|streets?|architecture|cathedral|villas?|piazza)\b|деревн|улиц|архитектур|собор/i, name: 'ph-bank', label: 'A sense of place' },
]

/** Runs at build time, using the story and image captions rather than fetching images in the browser. */
export function selectPhotoshootHeroIcons(context: readonly string[], images: readonly { alt: string }[] = []): PhotoshootHeroIcon[] {
  const text = context.join(' ')
  const imageText = images.map(image => image.alt).join(' ')
  const pick = (rules: IconRule[], fallback: PhotoshootHeroIcon): PhotoshootHeroIcon => {
    // The story sets the context; an incidental prop in one caption must not override it.
    const rule = rules.find(rule => rule.match.test(text)) || rules.find(rule => rule.match.test(imageText))
    return rule ? { name: rule.name, label: rule.label } : fallback
  }
  return [
    pick(session, { name: 'ph-camera', label: 'Photography' }),
    pick(occasion, { name: 'ph-images', label: 'A photographic story' }),
    pick(setting, { name: 'ph-map-pin', label: 'On location' }),
  ]
}
