import { describe, expect, it } from 'vitest'
import { BLACK_EAGLE_CURRENT_SHAFTS } from './blackEagle'

describe('BLACK_EAGLE_CURRENT_SHAFTS', () => {
  it('contains the exact current Black Eagle model catalog', () => {
    expect(BLACK_EAGLE_CURRENT_SHAFTS).toHaveLength(66)

    const sizesFor = (model: string) => new Set(BLACK_EAGLE_CURRENT_SHAFTS
      .filter((entry) => entry.model === model)
      .map((entry) => entry.size))

    expect(sizesFor('X Impact')).toEqual(new Set(['200', '250', '300', '350', '400', '500']))
    expect(sizesFor('Rampage')).toEqual(new Set(['150', '200', '250', '300', '350', '400']))
    expect(sizesFor('Carnivore')).toEqual(new Set(['250', '300', '350', '400']))
    expect(sizesFor('Outlaw')).toEqual(new Set(['300', '350', '400', '500', '600', '700']))
    expect(sizesFor('Spartan')).toEqual(new Set(['200', '250', '300', '350', '400']))
    expect(sizesFor('Deep Impact')).toEqual(new Set(['300', '350', '400']))
    expect(sizesFor('Focus')).toEqual(new Set(['250', '300', '350', '400']))
    expect(sizesFor('PS23')).toEqual(new Set(['250', '300', '350', '400', '500']))
    expect(sizesFor('PS25')).toEqual(new Set(['250', '300', '350', '400']))
    expect(sizesFor('Revelation')).toHaveLength(11)
    expect(sizesFor('Intrepid')).toHaveLength(10)
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

    expect(BLACK_EAGLE_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Outlaw' && size === '700'
    ))).toMatchObject({
      od: 0.275,
      gpi: 6.1,
      pointInsert: 15,
      nockWeight: 8,
    })

    expect(BLACK_EAGLE_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Focus' && size === '250'
    ))).toMatchObject({
      od: 0.245,
      gpi: 10.5,
      stockLength: 32,
    })
  })
})
