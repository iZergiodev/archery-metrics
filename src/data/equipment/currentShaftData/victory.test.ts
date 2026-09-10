import { describe, expect, it } from 'vitest'
import { VICTORY_CURRENT_SHAFTS } from './victory'

describe('VICTORY_CURRENT_SHAFTS', () => {
  it('contains the exact current Victory model catalog', () => {
    expect(VICTORY_CURRENT_SHAFTS).toHaveLength(39)

    const sizesFor = (model: string) => new Set(VICTORY_CURRENT_SHAFTS
      .filter((entry) => entry.model === model)
      .map((entry) => entry.size))

    expect(sizesFor('VXT')).toEqual(new Set(['300', '355', '450', '550', '630']))
    expect(sizesFor('VAP')).toEqual(new Set([
      '350', '400', '450', '500', '600', '700',
      '800', '900', '1000', '1100', '1200',
    ]))
    expect(sizesFor('RIP TKO')).toEqual(new Set(['200', '250', '300', '350', '400']))
    expect(sizesFor('VX-27')).toEqual(new Set(['200']))
    expect(sizesFor('V-TAC 23')).toEqual(new Set(['270', '380', '480']))
    expect(sizesFor('3DHV')).toEqual(new Set(['300', '350', '400', '500', '600', '700', '800']))
  })

  it('preserves representative target and hunting specifications', () => {
    expect(VICTORY_CURRENT_SHAFTS.find(({ model, size }) => model === 'VXT' && size === '300'))
      .toMatchObject({
        od: 0.241,
        gpi: 8.3,
        bushingPin: 12,
        nockWeight: 3,
      })

    expect(VICTORY_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'RIP TKO' && size === '200'
    ))).toMatchObject({
      stockLength: 31,
      gpi: 10.6,
      pointInsert: 50,
      nockWeight: 9,
    })
  })
})
