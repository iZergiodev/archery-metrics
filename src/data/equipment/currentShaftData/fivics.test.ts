import { describe, expect, it } from 'vitest'
import { FIVICS_CURRENT_SHAFTS } from './fivics'

describe('FIVICS_CURRENT_SHAFTS', () => {
  it('contains the exact current FIVICS catalog', () => {
    expect(FIVICS_CURRENT_SHAFTS).toHaveLength(36)
    expect(new Set(FIVICS_CURRENT_SHAFTS.map(({ model }) => model))).toEqual(new Set([
      'FIVE-X',
      'TENPRO',
      'GOLDRO',
    ]))
  })

  it('preserves representative FIVE-X specifications and provenance', () => {
    expect(FIVICS_CURRENT_SHAFTS.find(({ size, model }) => model === 'FIVE-X' && size === '350'))
      .toMatchObject({
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

  it('adds TENPRO and GOLDRO from first-party 2026 tables', () => {
    expect(FIVICS_CURRENT_SHAFTS.find(({ model, size }) => model === 'TENPRO' && size === '400'))
      .toMatchObject({ od: 0.2354, gpi: 9.45, stockLength: 32 })
    expect(FIVICS_CURRENT_SHAFTS.find(({ model, size }) => model === 'GOLDRO' && size === '600'))
      .toMatchObject({ od: 0.2326, gpi: 8.26, stockLength: 30 })
  })
})
