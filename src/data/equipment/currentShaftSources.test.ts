import { describe, expect, it } from 'vitest'
import { CURRENT_SHAFT_SOURCES } from './currentShaftSources'
import type { CurrentShaftSource, CurrentShaftSourceId } from './currentShaftSources'

const ORIGINAL_ACCESS_DATE = '2026-07-11'
const EXPANSION_ACCESS_DATE = '2026-09-10'

const FIRST_PARTY_HOSTS = new Set([
  'eastonarchery.com',
  'victoryarchery.com',
  'goldtip.com',
  'blackeaglearrows.com',
  'skylonarchery.com',
  'fivics.com',
  'pandarusarchery.com',
  'feradyne.com',
  'bignami.it',
  'nijora.com',
])

const ORIGINAL_URLS = {
  easton_2026_x10: 'https://eastonarchery.com/arrows_/x10/',
  easton_2026_ace: 'https://eastonarchery.com/arrows_/a-c-e/',
  easton_2026_5_0: 'https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf',
  easton_2026_5mm_fmj: 'https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf',
  victory_2026_vxt: 'https://victoryarchery.com/arrows-target/vxt/',
  victory_2026_vap: 'https://victoryarchery.com/arrows-target/vap/',
  victory_2026_rip_tko: 'https://victoryarchery.com/arrows-hunting/rip-tko/',
  gold_tip_2026_pierce_tour:
    'https://goldtip.com/collections/arrows/products/kinetic-pierce-tour-target-arrows',
  gold_tip_2026_airstrike:
    'https://goldtip.com/collections/arrows/products/airstrike-hunting-arrows',
  gold_tip_2026_hunter_xt:
    'https://goldtip.com/collections/arrows/products/hunter-xt-hunting-arrows',
  black_eagle_2026_x_impact:
    'https://blackeaglearrows.com/collections/hunting-arrows/products/x-impact-fletched-arrows',
  black_eagle_2026_rampage:
    'https://blackeaglearrows.com/collections/hunting-arrows/products/rampage-fletched-arrows',
  skylon_2026_paragon: 'https://www.skylonarchery.com/arrows/id-3-2/paragon',
  fivics_2026_five_x: 'https://www.fivics.com/shop/product/detail/37',
  pandarus_2026_elite_ca320: 'https://www.pandarusarchery.com/elite_ca320',
} as const satisfies Partial<Record<CurrentShaftSourceId, string>>

describe('current shaft source registry', () => {
  it('keeps only first-party 2026 manufacturer sources', () => {
    for (const [id, source] of Object.entries(CURRENT_SHAFT_SOURCES) as [
      CurrentShaftSourceId,
      CurrentShaftSource,
    ][]) {
      const hostname = new URL(source.url).hostname.replace(/^www\./, '')
      const publicationOrAccessYear = source.publicationYear ?? Number(source.accessedOn.slice(0, 4))
      const originalUrl = ORIGINAL_URLS[id as keyof typeof ORIGINAL_URLS]
      const expectedAccessedOn = originalUrl ? ORIGINAL_ACCESS_DATE : EXPANSION_ACCESS_DATE

      expect(FIRST_PARTY_HOSTS.has(hostname), `${id} host ${hostname}`).toBe(true)
      expect(source.accessedOn).toBe(expectedAccessedOn)
      expect(publicationOrAccessYear).toBe(2026)
      if (originalUrl) {
        expect(source.url).toBe(originalUrl)
      }
    }
  })
})
