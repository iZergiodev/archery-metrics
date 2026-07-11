import { describe, expect, it } from 'vitest'
import { CURRENT_SHAFT_SOURCES } from './currentShaftSources'
import type { CurrentShaftSource, CurrentShaftSourceId } from './currentShaftSources'

const EXPECTED_HOSTS = {
  easton_2026_x10: 'eastonarchery.com',
  easton_2026_ace: 'eastonarchery.com',
  easton_2026_5_0: 'eastonarchery.com',
  easton_2026_5mm_fmj: 'eastonarchery.com',
  victory_2026_vxt: 'victoryarchery.com',
  victory_2026_vap: 'victoryarchery.com',
  victory_2026_rip_tko: 'victoryarchery.com',
  gold_tip_2026_pierce_tour: 'goldtip.com',
  gold_tip_2026_airstrike: 'goldtip.com',
  gold_tip_2026_hunter_xt: 'goldtip.com',
  black_eagle_2026_x_impact: 'blackeaglearrows.com',
  black_eagle_2026_rampage: 'blackeaglearrows.com',
  skylon_2026_paragon: 'skylonarchery.com',
  fivics_2026_five_x: 'fivics.com',
  pandarus_2026_elite_ca320: 'pandarusarchery.com',
} as const satisfies Record<CurrentShaftSourceId, string>

const EXPECTED_URLS = {
  easton_2026_x10: 'https://eastonarchery.com/arrows_/x10/',
  easton_2026_ace: 'https://eastonarchery.com/arrows_/a-c-e/',
  easton_2026_5_0: 'https://eastonarchery.com/arrows_/easton-5-0/',
  easton_2026_5mm_fmj: 'https://eastonarchery.com/arrows_/5mm-full-metal-jacket/',
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
} as const satisfies Record<CurrentShaftSourceId, string>

describe('current shaft source registry', () => {
  it('contains only the approved 2026 official manufacturer sources', () => {
    expect(Object.keys(CURRENT_SHAFT_SOURCES).sort()).toEqual(Object.keys(EXPECTED_HOSTS).sort())

    for (const [id, expectedHost] of Object.entries(EXPECTED_HOSTS) as [
      CurrentShaftSourceId,
      string,
    ][]) {
      const source: CurrentShaftSource = CURRENT_SHAFT_SOURCES[id]
      const hostname = new URL(source.url).hostname.replace(/^www\./, '')
      const publicationOrAccessYear = source.publicationYear ?? Number(source.accessedOn.slice(0, 4))

      expect(source.url).toBe(EXPECTED_URLS[id])
      expect(hostname).toBe(expectedHost)
      expect(source.accessedOn).toBe('2026-07-11')
      expect(publicationOrAccessYear).toBe(2026)
    }
  })
})
