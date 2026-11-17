import test from 'node:test'
import assert from 'node:assert/strict'
import { DIRECT_UNITS, DIRECT_UNIT_IDS } from '../src/data/direct-units.mjs'
import { directUnitRows, footerLinks, navCta, navigation, navSections } from '../src/data/site.ts'

test('menu order: Photoshoots, Apartments, Tours, Coast guide, News', () => {
  assert.deepEqual(navigation.map((item) => item.label), ['Photoshoots', 'Apartments', 'Tours', 'Coast guide', 'News'])
  assert.deepEqual(navCta, { label: 'Plan your day', href: '/contact/', icon: 'ph-chat-circle-dots' })
})

test('every panel item has a hub page for the no-JS fallback', () => {
  const hubs = Object.fromEntries(navigation.filter((item) => item.panel).map((item) => [item.label, item.href]))
  assert.deepEqual(hubs, {
    Photoshoots: '/photoshootings/',
    Apartments: '/apartments/',
    Tours: '/experience/',
    'Coast guide': '/guide/',
  })
  assert.equal(navigation.find((item) => item.label === 'News').panel, undefined)
})

test('panel ids are unique', () => {
  const ids = navigation.flatMap((item) => (item.panel ? [item.panel.id] : []))
  assert.equal(new Set(ids).size, ids.length)
})

test('apartments panel lists every direct unit once, linking to its booking page', () => {
  const ids = directUnitRows.map((row) => row.href.match(/^\/book\/([a-z]+)\/$/)[1])
  assert.deepEqual(new Set(ids), new Set(DIRECT_UNIT_IDS))
  assert.equal(ids.length, DIRECT_UNIT_IDS.length)
  for (const row of directUnitRows) {
    const unit = DIRECT_UNITS[row.href.split('/')[2]]
    assert.equal(row.note, unit.maxGuests === 1 ? '1 guest' : `Up to ${unit.maxGuests} guests`)
    assert.match(row.image, /^\/nav\/.+-thumb\.webp$/)
  }
  const stay = navigation.find((item) => item.label === 'Apartments')
  assert.equal(stay.badge, '−10%')
  assert.equal(stay.panel.blocks[0].href, '/apartments/#direct')
})

test('rows have either a photo or an icon', () => {
  for (const item of navigation) {
    for (const block of item.panel?.blocks ?? []) {
      if (block.kind !== 'rows') continue
      for (const row of block.items) assert.ok(Boolean(row.image) !== Boolean(row.icon), row.label)
    }
  }
})

test('navSections flattens panels for the mobile menu', () => {
  const sections = navSections(navigation[0])
  assert.ok(sections.length >= 3)
  assert.ok(sections.every((s) => s.heading && s.items.every((link) => link.label && link.href.startsWith('/'))))
  assert.deepEqual(navSections(navigation[4]), [])
})

test('footer columns follow the menu', () => {
  assert.deepEqual(footerLinks.map((group) => group.heading), ['Photoshoots', 'Apartments', 'Tours', 'Coast guide', 'Amalfi.Day'])
  for (const group of footerLinks) {
    for (const link of group.links) {
      assert.match(link.icon, /^ph-/)
      assert.equal(Boolean(link.external), /^https?:/.test(link.href), link.label)
    }
  }
})
