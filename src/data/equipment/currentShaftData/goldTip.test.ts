import { describe, expect, it } from 'vitest'
import { GOLD_TIP_CURRENT_SHAFTS } from './goldTip'

describe('GOLD_TIP_CURRENT_SHAFTS', () => {
  it('contains the exact current Gold Tip model catalog', () => {
    expect(GOLD_TIP_CURRENT_SHAFTS).toHaveLength(31)

    const sizesFor = (model: string) => new Set(GOLD_TIP_CURRENT_SHAFTS
      .filter((entry) => entry.model === model)
      .map((entry) => entry.size))

    expect(sizesFor('Kinetic Pierce Tour')).toEqual(new Set([
      '700', '600', '500', '400', '340', '300', '250',
    ]))
    expect(sizesFor('Airstrike')).toEqual(new Set(['400', '340', '300', '250']))
    expect(sizesFor('Hunter XT')).toEqual(new Set(['500', '400', '340', '300', '250']))
    expect(sizesFor('Pierce LRT')).toEqual(new Set(['500', '400', '340', '300', '250']))
    expect(sizesFor('Kinetic')).toEqual(new Set(['500', '400', '340', '300', '200']))
    expect(sizesFor('30X')).toEqual(new Set(['150']))
    expect(sizesFor('Triple X')).toEqual(new Set(['100']))
    expect(sizesFor('Nine.3 Max')).toEqual(new Set(['250']))
    expect(sizesFor('Series 22')).toEqual(new Set(['300']))
    expect(sizesFor('X-Cutter')).toEqual(new Set(['250']))
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

    expect(GOLD_TIP_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Pierce LRT' && size === '400'
    ))).toMatchObject({
      useCategory: 'hunting',
      od: 0.229,
      stockLength: 32,
      gpi: 7.5,
      pointInsert: 0,
      nockWeight: 0,
    })

    expect(GOLD_TIP_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Kinetic' && size === '200'
    ))).toMatchObject({
      od: 0.282,
      stockLength: 32,
      gpi: 11.6,
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
