import { describe, expect, it } from 'vitest'
import { makeCurrentShaftEntries } from './types'

describe('makeCurrentShaftEntries', () => {
  it('expands compact rows without changing units or component weights', () => {
    const entries = makeCurrentShaftEntries(
      {
        manufacturer: 'Easton',
        model: 'X10',
        useCategory: 'target',
        sourceId: 'easton_2026_x10',
      },
      [['410', 0.212, 33.75, 0.41, 8.5, 0, 0, 0]],
    )

    expect(entries).toEqual([{
      manufacturer: 'Easton',
      model: 'X10',
      size: '410',
      useCategory: 'target',
      sourceId: 'easton_2026_x10',
      od: 0.212,
      stockLength: 33.75,
      spine: 0.41,
      gpi: 8.5,
      pointInsert: 0,
      bushingPin: 0,
      nockWeight: 0,
    }])
  })
})
