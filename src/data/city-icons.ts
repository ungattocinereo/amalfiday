// One identity per city, shared by every location label across the site.
export const cityIcons: Readonly<Record<string, string>> = {
  amalfi: 'fa-building',
  positano: 'fa-house',
  ravello: 'fa-music',
  atrani: 'fa-water',
  praiano: 'fa-sun',
  maiori: 'fa-shop',
  minori: 'fa-mug-hot',
  cetara: 'fa-fish',
  'vietri sul mare': 'fa-palette',
  'conca dei marini': 'fa-gem',
  furore: 'fa-bridge',
  sorrento: 'fa-lemon',
  tramonti: 'fa-tree',
  agerola: 'fa-mountain-sun',
  scala: 'fa-church',
  salerno: 'fa-ship',
  naples: 'fa-volcano',
  capri: 'fa-sailboat',
  pompeii: 'fa-landmark',
  erchie: 'fa-anchor',
  castiglione: 'fa-stairs',
  chiunzi: 'fa-binoculars',
  'path of the gods': 'fa-person-hiking',
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
  return cityIcons[aliases[key] || key] || 'fa-location-dot'
}
