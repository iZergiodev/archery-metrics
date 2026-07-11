import { describe, expect, it } from 'vitest'
import { EASTON_CURRENT_SHAFTS } from './easton'

describe('EASTON_CURRENT_SHAFTS', () => {
  it('contains the exact current Easton model catalog', () => {
    expect(EASTON_CURRENT_SHAFTS).toHaveLength(45)
    expect(new Set(EASTON_CURRENT_SHAFTS.map(({ model }) => model))).toEqual(new Set([
      'X10',
      'A/C/E',
      '5.0',
      '5MM FMJ Classic',
      '5MM FMJ MAX',
    ]))
  })

  it('preserves representative target and hunting specifications', () => {
    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => model === 'X10' && size === '410'))
      .toMatchObject({
        od: 0.212,
        stockLength: 33.75,
        spine: 0.41,
        gpi: 8.5,
      })

    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => model === '5.0' && size === '200'))
      .toMatchObject({
        useCategory: 'hunting',
        sourceId: 'easton_2026_5_0',
        stockLength: 33,
        pointInsert: 0,
        nockWeight: 8,
      })

    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === '5MM FMJ MAX' && size === '200'
    ))).toMatchObject({
      sourceId: 'easton_2026_5mm_fmj',
      od: 0.28,
      stockLength: 33,
      spine: 0.2,
      gpi: 13.3,
    })
  })
})
