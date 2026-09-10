import type { ShaftEntry } from '../types'
import type { CurrentShaftSourceId } from '../currentShaftSources'

export type CurrentShaftEntry = ShaftEntry & {
  sourceId: CurrentShaftSourceId
}

export type CurrentShaftFamily = Pick<ShaftEntry, 'manufacturer' | 'model' | 'useCategory'> & {
  sourceId: CurrentShaftSourceId
}

export type CurrentShaftRow = readonly [
  size: string,
  od: number,
  stockLength: number,
  spine: number,
  gpi: number,
  pointInsert: number,
  bushingPin: number,
  nockWeight: number,
]

export function makeCurrentShaftEntries(
  family: CurrentShaftFamily,
  rows: readonly CurrentShaftRow[],
): CurrentShaftEntry[] {
  return rows.map(([
    size,
    od,
    stockLength,
    spine,
    gpi,
    pointInsert,
    bushingPin,
    nockWeight,
  ]) => ({
    ...family,
    size,
    od,
    stockLength,
    spine,
    gpi,
    pointInsert,
    bushingPin,
    nockWeight,
  }))
}
