import { describe, expect, it } from 'vitest'
import { SKYLON_CURRENT_SHAFTS } from './skylon'

describe('SKYLON_CURRENT_SHAFTS', () => {
  it('contains the exact current Skylon Paragon catalog', () => {
    expect(SKYLON_CURRENT_SHAFTS).toHaveLength(13)
    expect(SKYLON_CURRENT_SHAFTS.map(({ size }) => size)).toEqual([
      '1000', '900', '850', '800', '750', '700', '650',
      '600', '550', '500', '450', '400', '350',
    ])
  })

  it('preserves representative Paragon specifications', () => {
    expect(SKYLON_CURRENT_SHAFTS.find(({ size }) => size === '1000')).toMatchObject({
      od: 0.1752,
      stockLength: 30,
      gpi: 4.7,
      nockWeight: 0,
    })
  })
})
