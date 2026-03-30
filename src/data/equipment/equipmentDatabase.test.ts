import { describe, expect, it } from 'vitest'
import { SHAFT_DATABASE } from './shaftDatabase'
import { FLETCH_DATABASE } from './fletchDatabase'
import { NOCK_DATABASE } from './nockDatabase'

describe('shaft database', () => {
  it('has entries', () => {
    expect(SHAFT_DATABASE.length).toBeGreaterThan(3500)
  })

  it('all entries have valid required fields', () => {
    for (const entry of SHAFT_DATABASE) {
      expect(entry.manufacturer).toBeTruthy()
      expect(entry.model).toBeTruthy()
      expect(entry.size).toBeTruthy()
      expect(['base', 'hunting', 'target']).toContain(entry.useCategory)
      expect(entry.spine).toBeGreaterThan(0)
      expect(entry.gpi).toBeGreaterThan(0)
      expect(entry.stockLength).toBeGreaterThanOrEqual(0)
    }
  })

  it('contains the Victory 3DHV Elite 400-FB reference case', () => {
    const match = SHAFT_DATABASE.find(
      (e) => e.manufacturer === 'Victory Archery' && e.model === '3DHV Elite' && e.size === '400-FB',
    )
    expect(match).toBeDefined()
    expect(match!.spine).toBeCloseTo(0.4, 2)
    expect(match!.gpi).toBeCloseTo(5.9, 1)
  })

  it('has multiple manufacturers', () => {
    const manufacturers = new Set(SHAFT_DATABASE.map((e) => e.manufacturer))
    expect(manufacturers.size).toBeGreaterThan(40)
  })
})

describe('fletch database', () => {
  it('has entries', () => {
    expect(FLETCH_DATABASE.length).toBeGreaterThan(300)
  })

  it('all entries have valid required fields', () => {
    for (const entry of FLETCH_DATABASE) {
      expect(entry.manufacturer).toBeTruthy()
      expect(entry.model).toBeTruthy()
      expect(entry.weight).toBeGreaterThanOrEqual(0)
      expect(entry.length).toBeGreaterThan(0)
      expect(entry.height).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('nock database', () => {
  it('has entries', () => {
    expect(NOCK_DATABASE.length).toBeGreaterThan(400)
  })

  it('all entries have valid required fields', () => {
    for (const entry of NOCK_DATABASE) {
      expect(entry.manufacturer).toBeTruthy()
      expect(entry.model).toBeTruthy()
      expect(entry.weight).toBeGreaterThanOrEqual(0)
    }
  })
})
