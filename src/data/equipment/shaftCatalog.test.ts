import { describe, expect, it } from 'vitest'
import { mergeShaftCatalog, shaftKey } from './shaftCatalog'
import type { ShaftEntry } from './types'

function shaft(model: string, size: string, spine: number, gpi = 7): ShaftEntry {
  return {
    manufacturer: 'Gold Tip',
    model,
    size,
    useCategory: 'target',
    od: 0.22,
    stockLength: 32,
    spine,
    gpi,
    pointInsert: 0,
    bushingPin: 0,
    nockWeight: 0,
  }
}

describe('mergeShaftCatalog', () => {
  it('keeps the first legacy row when duplicate identities exist', () => {
    const result = mergeShaftCatalog(
      [shaft('Duplicate', '400', 0.4, 7), shaft('Duplicate', '400', 0.4, 9)],
      [],
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.gpi).toBe(7)
  })

  it('uses the current row for an aliased legacy identity', () => {
    const result = mergeShaftCatalog(
      [shaft('Pierce Tour', '700', 0.5)],
      [shaft('Kinetic Pierce Tour', '700', 0.7)],
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.model).toBe('Kinetic Pierce Tour')
    expect(result[0]?.spine).toBe(0.7)
  })

  it('normalizes compatibility forms, case, and surrounding or repeated whitespace', () => {
    const normalized = shaft('VAP', '400 target', 0.4)
    const compatibilityForm = {
      ...shaft('  ＶＡＰ  ', '  ４００　　ＴＡＲＧＥＴ  ', 0.4),
      manufacturer: '  ＧＯＬＤ　　ＴＩＰ  ',
    }

    expect(shaftKey(compatibilityForm)).toBe(shaftKey(normalized))
  })

  it('appends a new current row when no legacy rows exist', () => {
    const current = shaft('New Current', '500', 0.5)

    expect(mergeShaftCatalog([], [current])).toEqual([current])
  })
})
