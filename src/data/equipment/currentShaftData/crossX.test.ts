import { describe, expect, it } from 'vitest'
import { CROSS_X_CURRENT_SHAFTS } from './crossX'

describe('CROSS_X_CURRENT_SHAFTS', () => {
  it('contains the reviewed first-party Cross-X competition families', () => {
    expect(CROSS_X_CURRENT_SHAFTS).toHaveLength(47)
    expect(new Set(CROSS_X_CURRENT_SHAFTS.map(({ model }) => model))).toEqual(new Set([
      'Plurima',
      'Hurricane Cube',
      'Ambition Gold',
      'Maior Cube',
      'XXIII',
      'Fulmen XXL',
    ]))
  })

  it('converts official millimetre outside diameters', () => {
    expect(CROSS_X_CURRENT_SHAFTS.find(({ model, size }) => model === 'Plurima' && size === '350'))
      .toMatchObject({ od: 0.2118, gpi: 9.07, stockLength: 32 })
    expect(CROSS_X_CURRENT_SHAFTS.find(({ model }) => model === 'XXIII'))
      .toMatchObject({ size: '350', od: 0.3654, gpi: 10.3 })
  })
})
