import { describe, expect, it } from 'vitest'
import { FIVICS_CURRENT_SHAFTS } from './fivics'

describe('FIVICS_CURRENT_SHAFTS', () => {
  it('contains the exact current FIVICS FIVE-X catalog', () => {
    expect(FIVICS_CURRENT_SHAFTS).toHaveLength(13)
    expect(FIVICS_CURRENT_SHAFTS.map(({ size }) => size)).toEqual([
      '350', '400', '450', '500', '550', '600', '650',
      '700', '750', '800', '850', '900', '1000',
    ])
  })

  it('preserves representative FIVE-X specifications and provenance', () => {
    expect(FIVICS_CURRENT_SHAFTS.find(({ size }) => size === '350')).toMatchObject({
      manufacturer: 'FIVICS',
      model: 'FIVE-X',
      useCategory: 'target',
      sourceId: 'fivics_2026_five_x',
      od: 0.2126,
      stockLength: 33,
      spine: 0.35,
      gpi: 8.75,
      pointInsert: 0,
      bushingPin: 0,
      nockWeight: 0,
    })
  })
})
