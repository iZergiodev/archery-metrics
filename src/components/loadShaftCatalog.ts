import type { ShaftEntry } from '../data/equipment/types'

export async function loadShaftCatalog(): Promise<ShaftEntry[]> {
  const { SHAFT_CATALOG } = await import('../data/equipment/shaftCatalog')
  return SHAFT_CATALOG
}
