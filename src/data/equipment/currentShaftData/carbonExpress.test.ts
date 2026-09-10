import { describe, expect, it } from 'vitest'
import { CARBON_EXPRESS_CURRENT_SHAFTS } from './carbonExpress'

describe('CARBON_EXPRESS_CURRENT_SHAFTS', () => {
  it('contains the reviewed first-party Carbon Express target families', () => {
    expect(CARBON_EXPRESS_CURRENT_SHAFTS).toHaveLength(11)
    expect(new Set(CARBON_EXPRESS_CURRENT_SHAFTS.map(({ model }) => model))).toEqual(new Set([
      'Nano Pro RZ',
      'Maxima XL 23',
      'TANK 25',
    ]))
  })

  it('preserves representative indoor and outdoor specifications', () => {
    expect(CARBON_EXPRESS_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Nano Pro RZ' && size === '350'
    ))).toMatchObject({ od: 0.216, stockLength: 33, gpi: 9.6 })
    expect(CARBON_EXPRESS_CURRENT_SHAFTS.find(({ model }) => model === 'TANK 25'))
      .toMatchObject({ size: '400', od: 0.382, gpi: 7.1 })
  })
})
