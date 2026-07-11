import { describe, expect, it } from 'vitest'
import { PANDARUS_CURRENT_SHAFTS } from './pandarus'

describe('PANDARUS_CURRENT_SHAFTS', () => {
  it('contains the exact current Pandarus ELITE CA320 catalog', () => {
    expect(PANDARUS_CURRENT_SHAFTS).toHaveLength(14)
    expect(PANDARUS_CURRENT_SHAFTS.map(({ size }) => size)).toEqual([
      '325', '350', '380', '410', '450', '500', '550',
      '600', '650', '700', '750', '830', '900', '1000',
    ])
  })

  it('preserves representative ELITE CA320 specifications and provenance', () => {
    expect(PANDARUS_CURRENT_SHAFTS.find(({ size }) => size === '325')).toMatchObject({
      manufacturer: 'Pandarus',
      model: 'ELITE CA320',
      useCategory: 'target',
      sourceId: 'pandarus_2026_elite_ca320',
      od: 0.2291,
      stockLength: 32,
      spine: 0.325,
      gpi: 9.2,
      pointInsert: 0,
      bushingPin: 0,
      nockWeight: 0,
    })
  })

  it('does not auto-fill component weights not specified by the manufacturer', () => {
    expect(PANDARUS_CURRENT_SHAFTS.every((shaft) => (
      shaft.pointInsert === 0
      && shaft.bushingPin === 0
      && shaft.nockWeight === 0
    ))).toBe(true)
  })
})
