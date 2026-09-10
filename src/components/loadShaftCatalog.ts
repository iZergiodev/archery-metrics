import type { ShaftEntry } from '../data/equipment/types'

export function createSingleFlightLoader<T>(load: () => Promise<T>): () => Promise<T> {
  let inFlight: Promise<T> | undefined

  return () => {
    if (inFlight) return inFlight

    inFlight = load().catch((error: unknown) => {
      inFlight = undefined
      throw error
    })
    return inFlight
  }
}

const loadShaftCatalogOnce = createSingleFlightLoader(
  () => import('../data/equipment/shaftCatalog').then(({ SHAFT_CATALOG }) => SHAFT_CATALOG),
)

export function loadShaftCatalog(): Promise<ShaftEntry[]> {
  return loadShaftCatalogOnce()
}
