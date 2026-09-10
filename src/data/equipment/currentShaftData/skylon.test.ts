import { describe, expect, it } from 'vitest'
import { SKYLON_CURRENT_SHAFTS } from './skylon'

describe('SKYLON_CURRENT_SHAFTS', () => {
  it('contains the exact current Skylon catalog', () => {
    expect(SKYLON_CURRENT_SHAFTS).toHaveLength(91)

    const sizesFor = (model: string) => SKYLON_CURRENT_SHAFTS
      .filter((entry) => entry.model === model)
      .map((entry) => entry.size)

    expect(sizesFor('Paragon')).toEqual([
      '1000', '900', '850', '800', '750', '700', '650',
      '600', '550', '500', '450', '400', '350',
    ])
    expect(sizesFor('Preminens')).toEqual([
      '650', '600', '550', '500', '450', '400', '350',
    ])
    expect(sizesFor('Radius')).toHaveLength(17)
    expect(sizesFor('Brixxon')).toHaveLength(13)
    expect(sizesFor('Empros')).toEqual(['500', '400', '350', '300'])
    expect(sizesFor('Edge')).toEqual(['800', '700', '600', '500', '400', '350', '300'])
    expect(sizesFor('Performa')).toHaveLength(13)
    expect(sizesFor('Precium')).toHaveLength(13)
    expect(sizesFor('Bruxx')).toEqual(['500', '400', '350', '300'])
  })

  it('preserves representative Paragon specifications', () => {
    expect(SKYLON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Paragon' && size === '1000'
    ))).toMatchObject({
      od: 0.1752,
      stockLength: 30,
      gpi: 4.7,
      nockWeight: 0,
    })
  })

  it('converts official millimetre outside diameters for the expanded families', () => {
    expect(SKYLON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Radius' && size === '400'
    ))).toMatchObject({
      od: 0.2413,
      stockLength: 32,
      gpi: 9.47,
    })

    expect(SKYLON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Empros' && size === '300'
    ))).toMatchObject({
      useCategory: 'target',
      od: 0.3622,
      stockLength: 33,
      gpi: 9.5,
    })

    expect(SKYLON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Edge' && size === '300'
    ))).toMatchObject({
      useCategory: 'hunting',
      od: 0.2972,
      gpi: 8.5,
    })
  })
})
