import { describe, expect, it } from 'vitest'
import { CURRENT_SHAFT_DATABASE } from './currentShaftDatabase'
import { CURRENT_SHAFT_SOURCES } from './currentShaftSources'
import { SHAFT_CATALOG, shaftKey } from './shaftCatalog'

const EXPECTED_MANUFACTURERS = new Set([
  'Easton',
  'Victory Archery',
  'Gold Tip',
  'Black Eagle',
  'Skylon',
  'FIVICS',
  'Pandarus',
])

describe('CURRENT_SHAFT_DATABASE', () => {
  it('publishes all 134 current rows for the supported manufacturers', () => {
    expect(CURRENT_SHAFT_DATABASE).toHaveLength(134)
    expect(new Set(CURRENT_SHAFT_DATABASE.map(({ manufacturer }) => manufacturer)))
      .toEqual(EXPECTED_MANUFACTURERS)
  })

  it('keeps every row linked to a source from the same manufacturer', () => {
    for (const entry of CURRENT_SHAFT_DATABASE) {
      expect(CURRENT_SHAFT_SOURCES).toHaveProperty(entry.sourceId)
      expect(CURRENT_SHAFT_SOURCES[entry.sourceId].manufacturer).toBe(entry.manufacturer)
    }
  })

  it('contains non-empty identities, valid categories, measurements, and component weights', () => {
    for (const entry of CURRENT_SHAFT_DATABASE) {
      expect(entry.manufacturer.trim()).not.toBe('')
      expect(entry.model.trim()).not.toBe('')
      expect(entry.size.trim()).not.toBe('')
      expect(['base', 'hunting', 'target']).toContain(entry.useCategory)

      for (const value of [entry.od, entry.stockLength, entry.spine, entry.gpi]) {
        expect(Number.isFinite(value)).toBe(true)
        expect(value).toBeGreaterThan(0)
      }

      for (const value of [entry.pointInsert, entry.bushingPin, entry.nockWeight]) {
        expect(Number.isFinite(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('uses a unique canonical identity for every current row', () => {
    const keys = CURRENT_SHAFT_DATABASE.map(shaftKey)

    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('SHAFT_CATALOG', () => {
  it('publishes a catalog with unique canonical identities', () => {
    const keys = SHAFT_CATALOG.map(shaftKey)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it('uses the current Kinetic Pierce Tour 700 measurements', () => {
    const entry = SHAFT_CATALOG.find(({ manufacturer, model, size }) => (
      manufacturer === 'Gold Tip'
      && model === 'Kinetic Pierce Tour'
      && size === '700'
    ))

    expect(entry).toMatchObject({ spine: 0.7, gpi: 5.5 })
  })

  it('preserves the legacy Victory 3DHV Elite 400-FB row', () => {
    expect(SHAFT_CATALOG).toContainEqual(expect.objectContaining({
      manufacturer: 'Victory Archery',
      model: '3DHV Elite',
      size: '400-FB',
    }))
  })
})
