import { describe, expect, it } from 'vitest'
import { GOLD_TIP_CURRENT_SHAFTS } from './goldTip'

describe('GOLD_TIP_CURRENT_SHAFTS', () => {
  it('contains the exact current Gold Tip model catalog', () => {
    expect(GOLD_TIP_CURRENT_SHAFTS).toHaveLength(16)

    const sizesFor = (model: string) => new Set(GOLD_TIP_CURRENT_SHAFTS
      .filter((entry) => entry.model === model)
      .map((entry) => entry.size))

    expect(sizesFor('Kinetic Pierce Tour')).toEqual(new Set([
      '700', '600', '500', '400', '340', '300', '250',
    ]))
    expect(sizesFor('Airstrike')).toEqual(new Set(['400', '340', '300', '250']))
    expect(sizesFor('Hunter XT')).toEqual(new Set(['500', '400', '340', '300', '250']))
  })

  it('preserves representative target and hunting specifications', () => {
    expect(GOLD_TIP_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Kinetic Pierce Tour' && size === '700'
    ))).toMatchObject({
      spine: 0.7,
      pointInsert: 0,
      bushingPin: 0,
      nockWeight: 0,
    })

    expect(GOLD_TIP_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Airstrike' && size === '400'
    ))).toMatchObject({
      bushingPin: 3.4,
      nockWeight: 11.6,
    })

    expect(GOLD_TIP_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Hunter XT' && size === '500'
    ))).toMatchObject({
      useCategory: 'hunting',
      od: 0.291,
      pointInsert: 12.1,
      nockWeight: 12.2,
    })
  })

  it('combines the Airstrike insert and front Ballistic Collar in pointInsert', () => {
    const expectedPointInsertBySize = new Map([
      ['400', 39.1],
      ['340', 39.5],
      ['300', 39.2],
      ['250', 44.6],
    ])

    for (const [size, pointInsert] of expectedPointInsertBySize) {
      expect(GOLD_TIP_CURRENT_SHAFTS.find((entry) => (
        entry.model === 'Airstrike' && entry.size === size
      ))).toMatchObject({ pointInsert })
    }
  })
})
