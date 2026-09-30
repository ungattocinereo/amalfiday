// One identity per city, shared by every location label across the site.
export const cityIcons: Readonly<Record<string, string>> = {
  amalfi: 'ph-buildings',
  positano: 'ph-house',
  ravello: 'ph-music-notes',
  atrani: 'ph-waves',
  praiano: 'ph-sun',
  maiori: 'ph-storefront',
  minori: 'ph-coffee',
  cetara: 'ph-fish',
  'vietri sul mare': 'ph-palette',
  'conca dei marini': 'ph-diamond',
  furore: 'ph-bridge',
  sorrento: 'ph-orange-slice',
  tramonti: 'ph-tree',
  agerola: 'ph-mountains',
  scala: 'ph-church',
  salerno: 'ph-boat',
  naples: 'ph-fire',
  capri: 'ph-sailboat',
  pompeii: 'ph-bank',
  erchie: 'ph-anchor',
  castiglione: 'ph-stairs',
  chiunzi: 'ph-binoculars',
  'path of the gods': 'ph-person-simple-hike',
}

const aliases: Readonly<Record<string, string>> = {
  vietri: 'vietri sul mare',
  conca: 'conca dei marini',
  napoli: 'naples',
  pompei: 'pompeii',
  'fiordo di furore': 'furore',
  'furore (fiordo di furore)': 'furore',
  'sentiero degli dei': 'path of the gods',
}

export function getCityIcon(name: string): string {
  const key = name.trim().toLowerCase().replace(/\s+/g, ' ')
  return cityIcons[aliases[key] || key] || 'ph-map-pin'
}
