import { describe, expect, it } from 'vitest'
import { loadShaftCatalog } from './loadShaftCatalog'

describe('loadShaftCatalog', () => {
  it('loads both current-only and legacy shaft rows', async () => {
    const shafts = await loadShaftCatalog()

    expect(shafts).toContainEqual(expect.objectContaining({
      manufacturer: 'Pandarus',
      model: 'ELITE CA320',
      size: '325',
    }))
    expect(shafts).toContainEqual(expect.objectContaining({
      manufacturer: 'Victory Archery',
      model: '3DHV Elite',
      size: '400-FB',
    }))
  })
})
