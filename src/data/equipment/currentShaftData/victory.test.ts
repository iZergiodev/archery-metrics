import { describe, expect, it } from 'vitest'
import { VICTORY_CURRENT_SHAFTS } from './victory'

describe('VICTORY_CURRENT_SHAFTS', () => {
  it('contains the exact current Victory model catalog', () => {
    expect(VICTORY_CURRENT_SHAFTS).toHaveLength(21)
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
      nockWeight: 8,
    })
  })
})
