import type { ShaftEntry } from './types'

const MODEL_ALIASES: Readonly<Record<string, string>> = {
  'easton|ace': 'A/C/E',
  'easton|a.c.e.': 'A/C/E',
  'easton|easton 5.0': '5.0',
  'easton|5mm fmj': '5MM FMJ Classic',
  'easton|fmj 5mm': '5MM FMJ Classic',
  'victory archery|vap target': 'VAP',
  'gold tip|pierce tour': 'Kinetic Pierce Tour',
  'gold tip|kinetic pierce tour arrows .166': 'Kinetic Pierce Tour',
  'black eagle|x-impact': 'X Impact',
}

function normalizeSegment(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US')
}

function canonicalDisplaySegment(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ')
}

function canonicalModel(manufacturer: string, model: string): string {
  const aliasKey = `${normalizeSegment(manufacturer)}|${normalizeSegment(model)}`

  return MODEL_ALIASES[aliasKey] ?? canonicalDisplaySegment(model)
}

function canonicalizeShaftEntry(entry: ShaftEntry): ShaftEntry {
  const manufacturer = canonicalDisplaySegment(entry.manufacturer)

  return {
    ...entry,
    manufacturer,
    model: canonicalModel(manufacturer, entry.model),
    size: canonicalDisplaySegment(entry.size),
  }
}

export function shaftKey(entry: ShaftEntry): string {
  return [
    normalizeSegment(entry.manufacturer),
    normalizeSegment(canonicalModel(entry.manufacturer, entry.model)),
    normalizeSegment(entry.size),
  ].join('|')
}

export function mergeShaftCatalog(
  legacyRows: readonly ShaftEntry[],
  currentRows: readonly ShaftEntry[],
): ShaftEntry[] {
  const result: ShaftEntry[] = []
  const indexesByKey = new Map<string, number>()

  for (const row of legacyRows) {
    const entry = canonicalizeShaftEntry(row)
    const key = shaftKey(entry)

    if (indexesByKey.has(key)) {
      continue
    }

    indexesByKey.set(key, result.length)
    result.push(entry)
  }

  for (const row of currentRows) {
    const entry = canonicalizeShaftEntry(row)
    const key = shaftKey(entry)
    const existingIndex = indexesByKey.get(key)

    if (existingIndex === undefined) {
      indexesByKey.set(key, result.length)
      result.push(entry)
    } else {
      result[existingIndex] = entry
    }
  }

  return result
}
