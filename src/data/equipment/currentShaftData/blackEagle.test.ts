import { describe, expect, it } from 'vitest'
import { BLACK_EAGLE_CURRENT_SHAFTS } from './blackEagle'

describe('BLACK_EAGLE_CURRENT_SHAFTS', () => {
  it('contains the exact current Black Eagle model catalog', () => {
    expect(BLACK_EAGLE_CURRENT_SHAFTS).toHaveLength(12)

    const sizesFor = (model: string) => new Set(BLACK_EAGLE_CURRENT_SHAFTS
      .filter((entry) => entry.model === model)
      .map((entry) => entry.size))

    expect(sizesFor('X Impact')).toEqual(new Set(['200', '250', '300', '350', '400', '500']))
    expect(sizesFor('Rampage')).toEqual(new Set(['150', '200', '250', '300', '350', '400']))
  })

  it('preserves representative hunting specifications', () => {
    expect(BLACK_EAGLE_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Rampage' && size === '200'
    ))).toMatchObject({
      od: 0.285,
      gpi: 12.8,
      pointInsert: 50,
      bushingPin: 3,
      nockWeight: 7,
    })

    expect(BLACK_EAGLE_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'X Impact' && size === '400'
    ))).toMatchObject({
      useCategory: 'hunting',
      pointInsert: 58,
      bushingPin: 3,
      nockWeight: 6,
    })
  })
})
