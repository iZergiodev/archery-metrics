import { describe, expect, it } from 'vitest'
import { createSingleFlightLoader, loadShaftCatalog } from './loadShaftCatalog'

describe('loadShaftCatalog', () => {
  it('reuses one in-flight catalog load', async () => {
    const firstLoad = loadShaftCatalog()

    expect(loadShaftCatalog()).toBe(firstLoad)
    await firstLoad
  })

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

  it('allows a new load after the in-flight operation rejects', async () => {
    const failure = new Error('catalog unavailable')
    let attempts = 0
    const load = createSingleFlightLoader(() => {
      attempts += 1
      return attempts === 1 ? Promise.reject(failure) : Promise.resolve('catalog')
    })

    const failedLoad = load()
    expect(load()).toBe(failedLoad)
    await expect(failedLoad).rejects.toBe(failure)
    await expect(load()).resolves.toBe('catalog')
    expect(attempts).toBe(2)
  })
})
