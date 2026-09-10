# Current Shaft Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 134 current, manufacturer-verified shaft variants from seven manufacturers while preserving the generated legacy database and making the displayed catalog unique and deterministic.

**Architecture:** Keep the generated legacy array immutable, store official sources and current rows in maintained modules grouped by manufacturer, and merge both layers through a canonical `(manufacturer, model, size)` key. Current rows override matching legacy rows; the first legacy row wins legacy-only collisions so existing visible behavior is preserved.

**Tech Stack:** TypeScript 5.9, React 19, Vitest 2, Vite 7, pnpm.

---

## File Map

- Create `src/data/equipment/currentShaftSources.ts`: official source registry and source ID type.
- Create `src/data/equipment/currentShaftSources.test.ts`: first-party URL and freshness checks.
- Create `src/data/equipment/currentShaftData/types.ts`: typed row builder shared by manufacturer modules.
- Create `src/data/equipment/currentShaftData/types.test.ts`: builder behavior test.
- Create `src/data/equipment/currentShaftData/easton.ts`: Easton current rows.
- Create `src/data/equipment/currentShaftData/victory.ts`: Victory current rows.
- Create `src/data/equipment/currentShaftData/goldTip.ts`: Gold Tip current rows.
- Create `src/data/equipment/currentShaftData/blackEagle.ts`: Black Eagle current rows.
- Create `src/data/equipment/currentShaftData/skylon.ts`: Skylon current rows.
- Create `src/data/equipment/currentShaftData/fivics.ts`: FIVICS current rows.
- Create `src/data/equipment/currentShaftData/pandarus.ts`: Pandarus current rows.
- Create one adjacent `*.test.ts` file for each manufacturer module.
- Create `src/data/equipment/currentShaftData/index.ts`: aggregate manufacturer arrays.
- Create `src/data/equipment/currentShaftDatabase.ts`: stable public export for current rows.
- Create `src/data/equipment/currentShaftDatabase.test.ts`: aggregate data integrity and regression checks.
- Create `src/data/equipment/shaftCatalog.ts`: normalization, aliases, merge, and public merged export.
- Create `src/data/equipment/shaftCatalog.test.ts`: merge behavior and final uniqueness checks.
- Create `src/components/loadShaftCatalog.ts`: single-flight dynamic loader for the merged catalog.
- Create `src/components/DatabasePanel.test.ts`: Node-environment loader and retry tests.
- Modify `src/components/DatabasePanel.tsx`: load the merged catalog with an in-flight guard.

## Task 1: Add the official source registry

**Files:**
- Create: `src/data/equipment/currentShaftSources.test.ts`
- Create: `src/data/equipment/currentShaftSources.ts`

- [ ] **Step 1: Write the failing source-registry test**

```ts
import { describe, expect, it } from 'vitest'
import {
  CURRENT_SHAFT_SOURCES,
  type CurrentShaftSource,
  type CurrentShaftSourceId,
} from './currentShaftSources'

const EXPECTED_URLS = {
  easton_2026_x10: 'https://eastonarchery.com/arrows_/x10/',
  easton_2026_ace: 'https://eastonarchery.com/arrows_/a-c-e/',
  easton_2026_5_0: 'https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf',
  easton_2026_5mm_fmj: 'https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf',
  victory_2026_vxt: 'https://victoryarchery.com/arrows-target/vxt/',
  victory_2026_vap: 'https://victoryarchery.com/arrows-target/vap/',
  victory_2026_rip_tko: 'https://victoryarchery.com/arrows-hunting/rip-tko/',
  gold_tip_2026_pierce_tour:
    'https://goldtip.com/collections/arrows/products/kinetic-pierce-tour-target-arrows',
  gold_tip_2026_airstrike:
    'https://goldtip.com/collections/arrows/products/airstrike-hunting-arrows',
  gold_tip_2026_hunter_xt:
    'https://goldtip.com/collections/arrows/products/hunter-xt-hunting-arrows',
  black_eagle_2026_x_impact:
    'https://blackeaglearrows.com/collections/hunting-arrows/products/x-impact-fletched-arrows',
  black_eagle_2026_rampage:
    'https://blackeaglearrows.com/collections/hunting-arrows/products/rampage-fletched-arrows',
  skylon_2026_paragon: 'https://www.skylonarchery.com/arrows/id-3-2/paragon',
  fivics_2026_five_x: 'https://www.fivics.com/shop/product/detail/37',
  pandarus_2026_elite_ca320: 'https://www.pandarusarchery.com/elite_ca320',
} as const satisfies Record<CurrentShaftSourceId, string>

describe('current shaft sources', () => {
  it('contains exactly the reviewed first-party sources', () => {
    expect(Object.keys(CURRENT_SHAFT_SOURCES).sort()).toEqual(Object.keys(EXPECTED_URLS).sort())

    for (const id of Object.keys(EXPECTED_URLS) as CurrentShaftSourceId[]) {
      const source: CurrentShaftSource = CURRENT_SHAFT_SOURCES[id]
      expect(source.url).toBe(EXPECTED_URLS[id])
      expect(source.accessedOn).toBe('2026-07-11')
      expect(source.publicationYear ?? Number(source.accessedOn.slice(0, 4))).toBe(2026)
    }
  })
})
```

- [ ] **Step 2: Run the test and verify that the missing module fails**

Run: `pnpm test -- src/data/equipment/currentShaftSources.test.ts`

Expected: FAIL because `./currentShaftSources` does not exist.

- [ ] **Step 3: Create the source registry**

```ts
export type CurrentShaftSource = {
  manufacturer: string
  title: string
  url: string
  publicationYear?: number
  accessedOn: string
}

export const CURRENT_SHAFT_SOURCES = {
  easton_2026_x10: {
    manufacturer: 'Easton',
    title: 'X10 product specifications',
    url: 'https://eastonarchery.com/arrows_/x10/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  easton_2026_ace: {
    manufacturer: 'Easton',
    title: 'A/C/E product specifications',
    url: 'https://eastonarchery.com/arrows_/a-c-e/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  easton_2026_5_0: {
    manufacturer: 'Easton',
    title: 'Easton 5.0 product specifications',
    url: 'https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  easton_2026_5mm_fmj: {
    manufacturer: 'Easton',
    title: '5MM FMJ product specifications',
    url: 'https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  victory_2026_vxt: {
    manufacturer: 'Victory Archery',
    title: 'VXT target arrow specifications',
    url: 'https://victoryarchery.com/arrows-target/vxt/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  victory_2026_vap: {
    manufacturer: 'Victory Archery',
    title: 'VAP target arrow specifications',
    url: 'https://victoryarchery.com/arrows-target/vap/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  victory_2026_rip_tko: {
    manufacturer: 'Victory Archery',
    title: 'RIP TKO hunting arrow specifications',
    url: 'https://victoryarchery.com/arrows-hunting/rip-tko/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  gold_tip_2026_pierce_tour: {
    manufacturer: 'Gold Tip',
    title: 'Kinetic Pierce Tour Arrows .166',
    url: 'https://goldtip.com/collections/arrows/products/kinetic-pierce-tour-target-arrows',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  gold_tip_2026_airstrike: {
    manufacturer: 'Gold Tip',
    title: 'Airstrike Arrows .204',
    url: 'https://goldtip.com/collections/arrows/products/airstrike-hunting-arrows',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  gold_tip_2026_hunter_xt: {
    manufacturer: 'Gold Tip',
    title: 'Hunter XT Arrows .246',
    url: 'https://goldtip.com/collections/arrows/products/hunter-xt-hunting-arrows',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  black_eagle_2026_x_impact: {
    manufacturer: 'Black Eagle',
    title: 'X Impact Arrows and Shafts',
    url: 'https://blackeaglearrows.com/collections/hunting-arrows/products/x-impact-fletched-arrows',
    accessedOn: '2026-07-11',
  },
  black_eagle_2026_rampage: {
    manufacturer: 'Black Eagle',
    title: 'Rampage carbon hunting arrows and shafts',
    url: 'https://blackeaglearrows.com/collections/hunting-arrows/products/rampage-fletched-arrows',
    accessedOn: '2026-07-11',
  },
  skylon_2026_paragon: {
    manufacturer: 'Skylon',
    title: 'Paragon shaft specifications',
    url: 'https://www.skylonarchery.com/arrows/id-3-2/paragon',
    accessedOn: '2026-07-11',
  },
  fivics_2026_five_x: {
    manufacturer: 'FIVICS',
    title: 'FIVE-X shaft specifications',
    url: 'https://www.fivics.com/shop/product/detail/37',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  pandarus_2026_elite_ca320: {
    manufacturer: 'Pandarus',
    title: 'ELITE CA320 shaft specifications',
    url: 'https://www.pandarusarchery.com/elite_ca320',
    accessedOn: '2026-07-11',
  },
} as const satisfies Record<string, CurrentShaftSource>

export type CurrentShaftSourceId = keyof typeof CURRENT_SHAFT_SOURCES
```

- [ ] **Step 4: Run the source test**

Run: `pnpm test -- src/data/equipment/currentShaftSources.test.ts`

Expected: PASS, 1 test.

- [ ] **Step 5: Commit the registry**

```bash
git add src/data/equipment/currentShaftSources.ts src/data/equipment/currentShaftSources.test.ts
git commit -m "feat(data): add current shaft source registry"
```

## Task 2: Add the typed current-row builder

**Files:**
- Create: `src/data/equipment/currentShaftData/types.test.ts`
- Create: `src/data/equipment/currentShaftData/types.ts`

- [ ] **Step 1: Write the failing builder test**

```ts
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
```

- [ ] **Step 2: Run the test and verify that it fails**

Run: `pnpm test -- src/data/equipment/currentShaftData/types.test.ts`

Expected: FAIL because `./types` does not exist.

- [ ] **Step 3: Implement the builder and its labeled tuple**

```ts
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
```

- [ ] **Step 4: Run the builder test**

Run: `pnpm test -- src/data/equipment/currentShaftData/types.test.ts`

Expected: PASS, 1 test.

- [ ] **Step 5: Commit the builder**

```bash
git add src/data/equipment/currentShaftData/types.ts src/data/equipment/currentShaftData/types.test.ts
git commit -m "feat(data): add typed current shaft row builder"
```

## Task 3: Implement deterministic catalog identity and merging

**Files:**
- Create: `src/data/equipment/shaftCatalog.test.ts`
- Create: `src/data/equipment/shaftCatalog.ts`

- [ ] **Step 1: Write failing normalization and merge tests**

```ts
import { describe, expect, it } from 'vitest'
import type { ShaftEntry } from './types'
import { mergeShaftCatalog, shaftKey } from './shaftCatalog'

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

describe('shaft catalog merge', () => {
  it('keeps the first legacy row for a duplicate legacy key', () => {
    const merged = mergeShaftCatalog([
      shaft('Duplicate', '400', 0.4, 7),
      shaft('Duplicate', '400', 0.4, 9),
    ], [])

    expect(merged).toHaveLength(1)
    expect(merged[0].gpi).toBe(7)
  })

  it('uses aliases and lets a current row replace a stale legacy row', () => {
    const merged = mergeShaftCatalog(
      [shaft('Pierce Tour', '700', 0.5)],
      [shaft('Kinetic Pierce Tour', '700', 0.7)],
    )

    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({ model: 'Kinetic Pierce Tour', spine: 0.7 })
  })

  it('normalizes Unicode, whitespace, and case in keys', () => {
    expect(shaftKey(shaft('  VAP  ', ' 400 ', 0.4)))
      .toBe(shaftKey({ ...shaft('vap', '400', 0.4), manufacturer: 'gold tip' }))
  })

  it('appends new current rows', () => {
    const merged = mergeShaftCatalog([], [shaft('New Model', '500', 0.5)])
    expect(merged.map((entry) => entry.model)).toEqual(['New Model'])
  })
})
```

- [ ] **Step 2: Run the test and verify that it fails**

Run: `pnpm test -- src/data/equipment/shaftCatalog.test.ts`

Expected: FAIL because `./shaftCatalog` does not exist.

- [ ] **Step 3: Implement canonical aliases and the pure merge**

```ts
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

function canonicalModel(manufacturer: string, model: string): string {
  const aliasKey = `${normalizeSegment(manufacturer)}|${normalizeSegment(model)}`
  return MODEL_ALIASES[aliasKey] ?? model.normalize('NFKC').trim().replace(/\s+/g, ' ')
}

function canonicalizeShaftEntry(entry: ShaftEntry): ShaftEntry {
  return {
    ...entry,
    manufacturer: entry.manufacturer.normalize('NFKC').trim().replace(/\s+/g, ' '),
    model: canonicalModel(entry.manufacturer, entry.model),
    size: entry.size.normalize('NFKC').trim().replace(/\s+/g, ' '),
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
  const indexByKey = new Map<string, number>()

  for (const rawEntry of legacyRows) {
    const entry = canonicalizeShaftEntry(rawEntry)
    const key = shaftKey(entry)
    if (indexByKey.has(key)) continue
    indexByKey.set(key, result.length)
    result.push(entry)
  }

  for (const rawEntry of currentRows) {
    const entry = canonicalizeShaftEntry(rawEntry)
    const key = shaftKey(entry)
    const existingIndex = indexByKey.get(key)
    if (existingIndex === undefined) {
      indexByKey.set(key, result.length)
      result.push(entry)
    } else {
      result[existingIndex] = entry
    }
  }

  return result
}
```

- [ ] **Step 4: Run the merge tests**

Run: `pnpm test -- src/data/equipment/shaftCatalog.test.ts`

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit the merge engine**

```bash
git add src/data/equipment/shaftCatalog.ts src/data/equipment/shaftCatalog.test.ts
git commit -m "feat(data): add deterministic shaft catalog merge"
```

## Task 4: Add current Easton rows

**Files:**
- Create: `src/data/equipment/currentShaftData/easton.test.ts`
- Create: `src/data/equipment/currentShaftData/easton.ts`

- [ ] **Step 1: Write the failing Easton regression test**

```ts
import { describe, expect, it } from 'vitest'
import { EASTON_CURRENT_SHAFTS } from './easton'

describe('current Easton shafts', () => {
  it('contains the 45 reviewed 2026 variants', () => {
    expect(EASTON_CURRENT_SHAFTS).toHaveLength(45)
    expect(new Set(EASTON_CURRENT_SHAFTS.map((entry) => entry.model))).toEqual(new Set([
      'X10', 'A/C/E', '5.0', '5MM FMJ Classic', '5MM FMJ MAX',
    ]))
  })

  it('contains corrected representative rows', () => {
    expect(EASTON_CURRENT_SHAFTS.find((entry) => entry.model === 'X10' && entry.size === '410'))
      .toMatchObject({ od: 0.212, stockLength: 33.75, spine: 0.41, gpi: 8.5 })
    expect(EASTON_CURRENT_SHAFTS.find((entry) => entry.model === '5.0' && entry.size === '200'))
      .toMatchObject({ useCategory: 'hunting', pointInsert: 0, nockWeight: 8 })
  })
})
```

- [ ] **Step 2: Run the Easton test and verify that it fails**

Run: `pnpm test -- src/data/equipment/currentShaftData/easton.test.ts`

Expected: FAIL because `./easton` does not exist.

- [ ] **Step 3: Add the exact Easton rows**

The `pointInsert` value is `0` for 5.0 and FMJ because the same size can ship with either a HIT insert or a half-out and the selector has no package field. The exact included nock weight is retained.

```ts
import { makeCurrentShaftEntries, type CurrentShaftEntry } from './types'

export const EASTON_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    { manufacturer: 'Easton', model: 'X10', useCategory: 'target', sourceId: 'easton_2026_x10' },
    [
      ['325', 0.221, 34.25, 0.325, 9.2, 0, 0, 0],
      ['350', 0.218, 34, 0.35, 8.8, 0, 0, 0],
      ['380', 0.215, 33.75, 0.38, 8.9, 0, 0, 0],
      ['410', 0.212, 33.75, 0.41, 8.5, 0, 0, 0],
      ['450', 0.209, 33.5, 0.45, 8.1, 0, 0, 0],
      ['500', 0.206, 32, 0.5, 7.8, 0, 0, 0],
      ['550', 0.203, 31, 0.55, 7.5, 0, 0, 0],
      ['600', 0.2, 30, 0.6, 7, 0, 0, 0],
      ['650', 0.197, 29, 0.65, 6.8, 0, 0, 0],
      ['700', 0.194, 29, 0.7, 6.7, 0, 0, 0],
      ['750', 0.191, 29, 0.75, 6.4, 0, 0, 0],
      ['830', 0.188, 28.5, 0.83, 6.2, 0, 0, 0],
      ['900', 0.185, 28, 0.9, 5.8, 0, 0, 0],
      ['1000', 0.182, 28, 1, 5.3, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Easton', model: 'A/C/E', useCategory: 'target', sourceId: 'easton_2026_ace' },
    [
      ['370', 0.23, 32.62, 0.37, 7.9, 0, 0, 0],
      ['400', 0.23, 32.62, 0.4, 7.5, 0, 0, 0],
      ['430', 0.224, 32.62, 0.43, 7, 0, 0, 0],
      ['470', 0.223, 32.62, 0.47, 6.8, 0, 0, 0],
      ['520', 0.216, 31.62, 0.52, 6.7, 0, 0, 0],
      ['570', 0.216, 31.62, 0.57, 6.3, 0, 0, 0],
      ['620', 0.214, 30.62, 0.62, 6.1, 0, 0, 0],
      ['670', 0.212, 30.62, 0.67, 5.9, 0, 0, 0],
      ['720', 0.215, 29.62, 0.72, 6.4, 0, 0, 0],
      ['780', 0.216, 29.62, 0.78, 6, 0, 0, 0],
      ['850', 0.213, 28.62, 0.85, 5.7, 0, 0, 0],
      ['920', 0.213, 28.62, 0.92, 5.8, 0, 0, 0],
      ['1000', 0.213, 28.62, 1, 5.7, 0, 0, 0],
      ['1100', 0.205, 28.62, 1.1, 5.1, 0, 0, 0],
      ['1250', 0.205, 26.62, 1.25, 5.1, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Easton', model: '5.0', useCategory: 'hunting', sourceId: 'easton_2026_5_0' },
    [
      ['200', 0.273, 33, 0.2, 10.6, 0, 0, 8],
      ['250', 0.27, 32.75, 0.25, 9.5, 0, 0, 8],
      ['300', 0.264, 32.5, 0.3, 8.4, 0, 0, 8],
      ['340', 0.258, 32, 0.34, 7.5, 0, 0, 8],
      ['400', 0.253, 31.5, 0.4, 6.8, 0, 0, 8],
      ['500', 0.249, 31, 0.5, 6.2, 0, 0, 8],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Easton', model: '5MM FMJ Classic', useCategory: 'hunting', sourceId: 'easton_2026_5mm_fmj' },
    [
      ['250', 0.273, 33, 0.25, 11.5, 0, 0, 9],
      ['300', 0.273, 32.5, 0.3, 12, 0, 0, 9],
      ['340', 0.269, 32, 0.34, 11.3, 0, 0, 9],
      ['400', 0.263, 31.5, 0.4, 10.2, 0, 0, 9],
      ['500', 0.256, 31, 0.5, 9.1, 0, 0, 9],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Easton', model: '5MM FMJ MAX', useCategory: 'hunting', sourceId: 'easton_2026_5mm_fmj' },
    [
      ['200', 0.28, 33, 0.2, 13.3, 0, 0, 8],
      ['250', 0.269, 32.75, 0.25, 11.3, 0, 0, 8],
      ['300', 0.264, 32.5, 0.3, 10.3, 0, 0, 8],
      ['340', 0.261, 32, 0.34, 9.8, 0, 0, 8],
      ['400', 0.257, 31.5, 0.4, 9, 0, 0, 8],
    ],
  ),
]
```

- [ ] **Step 4: Run the Easton test**

Run: `pnpm test -- src/data/equipment/currentShaftData/easton.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit Easton data**

```bash
git add src/data/equipment/currentShaftData/easton.ts src/data/equipment/currentShaftData/easton.test.ts
git commit -m "feat(data): add current Easton shaft specs"
```

## Task 5: Add current Victory rows

**Files:**
- Create: `src/data/equipment/currentShaftData/victory.test.ts`
- Create: `src/data/equipment/currentShaftData/victory.ts`

- [ ] **Step 1: Write the failing Victory regression test**

```ts
import { describe, expect, it } from 'vitest'
import { VICTORY_CURRENT_SHAFTS } from './victory'

describe('current Victory shafts', () => {
  it('contains the 21 reviewed 2026 variants', () => {
    expect(VICTORY_CURRENT_SHAFTS).toHaveLength(21)
  })

  it('contains newly available and corrected rows', () => {
    expect(VICTORY_CURRENT_SHAFTS.find((entry) => entry.model === 'VXT' && entry.size === '300'))
      .toMatchObject({ od: 0.241, gpi: 8.3, bushingPin: 12, nockWeight: 3 })
    expect(VICTORY_CURRENT_SHAFTS.find((entry) => entry.model === 'RIP TKO' && entry.size === '200'))
      .toMatchObject({ stockLength: 31, gpi: 10.6, pointInsert: 50, nockWeight: 9 })
  })
})
```

- [ ] **Step 2: Run the Victory test and verify that it fails**

Run: `pnpm test -- src/data/equipment/currentShaftData/victory.test.ts`

Expected: FAIL because `./victory` does not exist.

- [ ] **Step 3: Add the exact Victory rows**

```ts
import { makeCurrentShaftEntries, type CurrentShaftEntry } from './types'

export const VICTORY_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    { manufacturer: 'Victory Archery', model: 'VXT', useCategory: 'target', sourceId: 'victory_2026_vxt' },
    [
      ['300', 0.241, 31, 0.3, 8.3, 0, 12, 3],
      ['355', 0.237, 31, 0.355, 7.4, 0, 12, 3],
      ['450', 0.236, 31, 0.45, 7.4, 0, 12, 3],
      ['550', 0.234, 31, 0.55, 7.1, 0, 12, 3],
      ['630', 0.235, 31, 0.63, 7.4, 0, 12, 3],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Victory Archery', model: 'VAP', useCategory: 'target', sourceId: 'victory_2026_vap' },
    [
      ['350', 0.232, 31, 0.35, 7.8, 0, 0, 8],
      ['400', 0.227, 31, 0.4, 7.2, 0, 0, 8],
      ['450', 0.223, 31, 0.45, 6.6, 0, 0, 8],
      ['500', 0.218, 31, 0.5, 6.1, 0, 0, 8],
      ['600', 0.214, 31, 0.6, 5.5, 0, 0, 8],
      ['700', 0.216, 31, 0.7, 5.7, 0, 0, 8],
      ['800', 0.213, 31, 0.8, 5.4, 0, 0, 8],
      ['900', 0.21, 31, 0.9, 5, 0, 0, 8],
      ['1000', 0.208, 31, 1, 4.7, 0, 0, 8],
      ['1100', 0.208, 31, 1.1, 4.9, 0, 0, 8],
      ['1200', 0.206, 31, 1.2, 4.6, 0, 0, 8],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Victory Archery', model: 'RIP TKO', useCategory: 'hunting', sourceId: 'victory_2026_rip_tko' },
    [
      ['200', 0.276, 31, 0.2, 10.6, 50, 0, 9],
      ['250', 0.266, 31, 0.25, 8.9, 50, 0, 9],
      ['300', 0.266, 31, 0.3, 8.8, 50, 0, 9],
      ['350', 0.265, 31, 0.35, 8.7, 50, 0, 9],
      ['400', 0.266, 31, 0.4, 9, 50, 0, 9],
    ],
  ),
]
```

- [ ] **Step 4: Run the Victory test**

Run: `pnpm test -- src/data/equipment/currentShaftData/victory.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit Victory data**

```bash
git add src/data/equipment/currentShaftData/victory.ts src/data/equipment/currentShaftData/victory.test.ts
git commit -m "feat(data): add current Victory shaft specs"
```

## Task 6: Add current Gold Tip rows

**Files:**
- Create: `src/data/equipment/currentShaftData/goldTip.test.ts`
- Create: `src/data/equipment/currentShaftData/goldTip.ts`

- [ ] **Step 1: Write the failing Gold Tip regression test**

```ts
import { describe, expect, it } from 'vitest'
import { GOLD_TIP_CURRENT_SHAFTS } from './goldTip'

describe('current Gold Tip shafts', () => {
  it('contains the 16 reviewed 2026 variants', () => {
    expect(GOLD_TIP_CURRENT_SHAFTS).toHaveLength(16)
  })

  it('preserves corrected rows and exact included hardware masses', () => {
    expect(GOLD_TIP_CURRENT_SHAFTS.find((entry) => entry.model === 'Kinetic Pierce Tour' && entry.size === '700'))
      .toMatchObject({ spine: 0.7, pointInsert: 0, bushingPin: 0, nockWeight: 0 })
    expect(GOLD_TIP_CURRENT_SHAFTS.find((entry) => entry.model === 'Hunter XT' && entry.size === '500'))
      .toMatchObject({ useCategory: 'hunting', od: 0.291, pointInsert: 12.1, nockWeight: 12.2 })

    const expectedAirstrikePointInsert = new Map([
      ['400', 39.1],
      ['340', 39.5],
      ['300', 39.2],
      ['250', 44.6],
    ])

    for (const [size, pointInsert] of expectedAirstrikePointInsert) {
      expect(GOLD_TIP_CURRENT_SHAFTS.find((entry) => entry.model === 'Airstrike' && entry.size === size))
        .toMatchObject({ pointInsert })
    }
  })
})
```

- [ ] **Step 2: Run the Gold Tip test and verify that it fails**

Run: `pnpm test -- src/data/equipment/currentShaftData/goldTip.test.ts`

Expected: FAIL because `./goldTip` does not exist.

- [ ] **Step 3: Add the exact Gold Tip rows**

Airstrike includes an aluminum insert and a front Ballistic Collar for each size. Because the form has no separate front-collar field, `pointInsert` stores their exact published sum: `39.1` for 400 (`24.3 + 14.8`), `39.5` for 340 (`24.9 + 14.6`), `39.2` for 300 (`25.4 + 13.8`), and `44.6` for 250 (`26.4 + 18.2`). Its rear nock collar still maps to `bushingPin`, and the published nock weight remains in `nockWeight`. These totals use exact first-party component masses, never inferred values.

```ts
import { makeCurrentShaftEntries, type CurrentShaftEntry } from './types'

export const GOLD_TIP_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    { manufacturer: 'Gold Tip', model: 'Kinetic Pierce Tour', useCategory: 'target', sourceId: 'gold_tip_2026_pierce_tour' },
    [
      ['700', 0.213, 30, 0.7, 5.5, 0, 0, 0],
      ['600', 0.219, 30, 0.6, 6.2, 0, 0, 0],
      ['500', 0.222, 30, 0.5, 6.6, 0, 0, 0],
      ['400', 0.229, 32, 0.4, 7.6, 0, 0, 0],
      ['340', 0.234, 32, 0.34, 8.3, 0, 0, 0],
      ['300', 0.24, 32, 0.3, 9.1, 0, 0, 0],
      ['250', 0.245, 32, 0.25, 9.8, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Gold Tip', model: 'Airstrike', useCategory: 'hunting', sourceId: 'gold_tip_2026_airstrike' },
    [
      // pointInsert combines the insert and front Ballistic Collar masses.
      ['400', 0.254, 32, 0.4, 7.2, 39.1, 3.4, 11.6],
      ['340', 0.258, 32, 0.34, 7.8, 39.5, 3.9, 11.6],
      ['300', 0.262, 32, 0.3, 8.5, 39.2, 4, 11.6],
      ['250', 0.269, 32, 0.25, 9.6, 44.6, 5, 11.6],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Gold Tip', model: 'Hunter XT', useCategory: 'hunting', sourceId: 'gold_tip_2026_hunter_xt' },
    [
      ['500', 0.291, 30, 0.5, 7.3, 12.1, 0, 12.2],
      ['400', 0.295, 32, 0.4, 8.2, 12.1, 0, 12.2],
      ['340', 0.3, 32, 0.34, 8.9, 12.1, 0, 12.2],
      ['300', 0.302, 32, 0.3, 9.3, 12.1, 0, 12.2],
      ['250', 0.309, 32, 0.25, 10.6, 12.1, 0, 12.2],
    ],
  ),
]
```

- [ ] **Step 4: Run the Gold Tip test**

Run: `pnpm test -- src/data/equipment/currentShaftData/goldTip.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit Gold Tip data**

```bash
git add src/data/equipment/currentShaftData/goldTip.ts src/data/equipment/currentShaftData/goldTip.test.ts
git commit -m "feat(data): add current Gold Tip shaft specs"
```

## Task 7: Add current Black Eagle rows

**Files:**
- Create: `src/data/equipment/currentShaftData/blackEagle.test.ts`
- Create: `src/data/equipment/currentShaftData/blackEagle.ts`

- [ ] **Step 1: Write the failing Black Eagle regression test**

```ts
import { describe, expect, it } from 'vitest'
import { BLACK_EAGLE_CURRENT_SHAFTS } from './blackEagle'

describe('current Black Eagle shafts', () => {
  it('contains the 12 reviewed current variants', () => {
    expect(BLACK_EAGLE_CURRENT_SHAFTS).toHaveLength(12)
  })

  it('adds Rampage 200 and current component packages', () => {
    expect(BLACK_EAGLE_CURRENT_SHAFTS.find((entry) => entry.model === 'Rampage' && entry.size === '200'))
      .toMatchObject({ od: 0.285, gpi: 12.8, pointInsert: 50, bushingPin: 3, nockWeight: 7 })
    expect(BLACK_EAGLE_CURRENT_SHAFTS.find((entry) => entry.model === 'X Impact' && entry.size === '400'))
      .toMatchObject({ useCategory: 'hunting', pointInsert: 58, bushingPin: 3, nockWeight: 6 })
  })
})
```

- [ ] **Step 2: Run the Black Eagle test and verify that it fails**

Run: `pnpm test -- src/data/equipment/currentShaftData/blackEagle.test.ts`

Expected: FAIL because `./blackEagle` does not exist.

- [ ] **Step 3: Add the exact Black Eagle rows**

```ts
import { makeCurrentShaftEntries, type CurrentShaftEntry } from './types'

export const BLACK_EAGLE_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    { manufacturer: 'Black Eagle', model: 'X Impact', useCategory: 'hunting', sourceId: 'black_eagle_2026_x_impact' },
    [
      ['200', 0.256, 32, 0.2, 11, 58, 3, 6],
      ['250', 0.24, 32, 0.25, 9.5, 58, 3, 6],
      ['300', 0.231, 32, 0.3, 8.1, 58, 3, 6],
      ['350', 0.228, 32, 0.35, 7.4, 58, 3, 6],
      ['400', 0.221, 32, 0.4, 6.7, 58, 3, 6],
      ['500', 0.214, 32, 0.5, 5.8, 58, 3, 6],
    ],
  ),
  ...makeCurrentShaftEntries(
    { manufacturer: 'Black Eagle', model: 'Rampage', useCategory: 'hunting', sourceId: 'black_eagle_2026_rampage' },
    [
      ['150', 0.307, 32, 0.15, 16, 50, 3, 7],
      ['200', 0.285, 32, 0.2, 12.8, 50, 3, 7],
      ['250', 0.276, 32, 0.25, 10.7, 50, 3, 7],
      ['300', 0.264, 32, 0.3, 8.7, 50, 3, 7],
      ['350', 0.261, 32, 0.35, 8.2, 50, 3, 7],
      ['400', 0.253, 32, 0.4, 7, 50, 3, 7],
    ],
  ),
]
```

- [ ] **Step 4: Run the Black Eagle test**

Run: `pnpm test -- src/data/equipment/currentShaftData/blackEagle.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit Black Eagle data**

```bash
git add src/data/equipment/currentShaftData/blackEagle.ts src/data/equipment/currentShaftData/blackEagle.test.ts
git commit -m "feat(data): add current Black Eagle shaft specs"
```

## Task 8: Add current Skylon rows

**Files:**
- Create: `src/data/equipment/currentShaftData/skylon.test.ts`
- Create: `src/data/equipment/currentShaftData/skylon.ts`

- [ ] **Step 1: Write the failing Skylon regression test**

```ts
import { describe, expect, it } from 'vitest'
import { SKYLON_CURRENT_SHAFTS } from './skylon'

describe('current Skylon shafts', () => {
  it('contains all 13 official Paragon sizes with converted OD values', () => {
    expect(SKYLON_CURRENT_SHAFTS).toHaveLength(13)
    expect(SKYLON_CURRENT_SHAFTS.find((entry) => entry.size === '1000'))
      .toMatchObject({ od: 0.1752, stockLength: 30, gpi: 4.7, nockWeight: 0 })
  })
})
```

- [ ] **Step 2: Run the Skylon test and verify that it fails**

Run: `pnpm test -- src/data/equipment/currentShaftData/skylon.test.ts`

Expected: FAIL because `./skylon` does not exist.

- [ ] **Step 3: Add the exact Skylon rows**

```ts
import { makeCurrentShaftEntries, type CurrentShaftEntry } from './types'

export const SKYLON_CURRENT_SHAFTS: CurrentShaftEntry[] = makeCurrentShaftEntries(
  { manufacturer: 'Skylon', model: 'Paragon', useCategory: 'target', sourceId: 'skylon_2026_paragon' },
  [
    ['1000', 0.1752, 30, 1, 4.7, 0, 0, 0],
    ['900', 0.1772, 30, 0.9, 4.81, 0, 0, 0],
    ['850', 0.1791, 30, 0.85, 4.94, 0, 0, 0],
    ['800', 0.1807, 31, 0.8, 5.06, 0, 0, 0],
    ['750', 0.1823, 31, 0.75, 5.31, 0, 0, 0],
    ['700', 0.1839, 31, 0.7, 5.55, 0, 0, 0],
    ['650', 0.1862, 31, 0.65, 5.83, 0, 0, 0],
    ['600', 0.1882, 32, 0.6, 6.1, 0, 0, 0],
    ['550', 0.1906, 32, 0.55, 6.5, 0, 0, 0],
    ['500', 0.1929, 32, 0.5, 6.9, 0, 0, 0],
    ['450', 0.1984, 32, 0.45, 7.42, 0, 0, 0],
    ['400', 0.2035, 32, 0.4, 7.93, 0, 0, 0],
    ['350', 0.2067, 32, 0.35, 8.47, 0, 0, 0],
  ],
)
```

- [ ] **Step 4: Run and commit the Skylon data**

Run: `pnpm test -- src/data/equipment/currentShaftData/skylon.test.ts`

Expected: PASS, 1 test.

```bash
git add src/data/equipment/currentShaftData/skylon.ts src/data/equipment/currentShaftData/skylon.test.ts
git commit -m "feat(data): add current Skylon shaft specs"
```

## Task 9: Add current FIVICS rows

**Files:**
- Create: `src/data/equipment/currentShaftData/fivics.test.ts`
- Create: `src/data/equipment/currentShaftData/fivics.ts`

- [ ] **Step 1: Write the failing FIVICS regression test**

```ts
import { describe, expect, it } from 'vitest'
import { FIVICS_CURRENT_SHAFTS } from './fivics'

describe('current FIVICS shafts', () => {
  it('adds all 13 FIVE-X sizes from the 2026 catalog', () => {
    expect(FIVICS_CURRENT_SHAFTS).toHaveLength(13)
    expect(FIVICS_CURRENT_SHAFTS.find((entry) => entry.size === '350'))
      .toMatchObject({ od: 0.2126, stockLength: 33, spine: 0.35, gpi: 8.75 })
  })
})
```

- [ ] **Step 2: Run the FIVICS test and verify that it fails**

Run: `pnpm test -- src/data/equipment/currentShaftData/fivics.test.ts`

Expected: FAIL because `./fivics` does not exist.

- [ ] **Step 3: Add the exact FIVICS rows**

```ts
import { makeCurrentShaftEntries, type CurrentShaftEntry } from './types'

export const FIVICS_CURRENT_SHAFTS: CurrentShaftEntry[] = makeCurrentShaftEntries(
  { manufacturer: 'FIVICS', model: 'FIVE-X', useCategory: 'target', sourceId: 'fivics_2026_five_x' },
  [
    ['350', 0.2126, 33, 0.35, 8.75, 0, 0, 0],
    ['400', 0.2072, 33, 0.4, 8.27, 0, 0, 0],
    ['450', 0.2021, 33, 0.45, 7.66, 0, 0, 0],
    ['500', 0.1985, 33, 0.5, 7.27, 0, 0, 0],
    ['550', 0.1952, 31, 0.55, 6.8, 0, 0, 0],
    ['600', 0.1922, 31, 0.6, 6.44, 0, 0, 0],
    ['650', 0.1895, 31, 0.65, 6.16, 0, 0, 0],
    ['700', 0.186, 29, 0.7, 5.84, 0, 0, 0],
    ['750', 0.1841, 29, 0.75, 5.52, 0, 0, 0],
    ['800', 0.1824, 29, 0.8, 5.4, 0, 0, 0],
    ['850', 0.1812, 28, 0.85, 5.28, 0, 0, 0],
    ['900', 0.1788, 28, 0.9, 4.97, 0, 0, 0],
    ['1000', 0.1765, 28, 1, 4.76, 0, 0, 0],
  ],
)
```

- [ ] **Step 4: Run and commit the FIVICS data**

Run: `pnpm test -- src/data/equipment/currentShaftData/fivics.test.ts`

Expected: PASS, 1 test.

```bash
git add src/data/equipment/currentShaftData/fivics.ts src/data/equipment/currentShaftData/fivics.test.ts
git commit -m "feat(data): add current FIVICS shaft specs"
```

## Task 10: Add current Pandarus rows without guessing component weights

**Files:**
- Create: `src/data/equipment/currentShaftData/pandarus.test.ts`
- Create: `src/data/equipment/currentShaftData/pandarus.ts`

- [ ] **Step 1: Write the failing Pandarus regression test**

```ts
import { describe, expect, it } from 'vitest'
import { PANDARUS_CURRENT_SHAFTS } from './pandarus'

describe('current Pandarus shafts', () => {
  it('adds all 14 ELITE CA320 sizes without guessed component weights', () => {
    expect(PANDARUS_CURRENT_SHAFTS).toHaveLength(14)
    expect(PANDARUS_CURRENT_SHAFTS.find((entry) => entry.size === '325'))
      .toMatchObject({ od: 0.2291, stockLength: 32, gpi: 9.2, pointInsert: 0, bushingPin: 0 })
    expect(PANDARUS_CURRENT_SHAFTS.every((entry) =>
      entry.pointInsert === 0 && entry.bushingPin === 0 && entry.nockWeight === 0,
    )).toBe(true)
  })
})
```

- [ ] **Step 2: Run the Pandarus test and verify that it fails**

Run: `pnpm test -- src/data/equipment/currentShaftData/pandarus.test.ts`

Expected: FAIL because `./pandarus` does not exist.

- [ ] **Step 3: Add the exact Pandarus shaft geometry**

The official page says that points, pins, and collars are supplied but publishes only point ranges and no exact pin/collar weight. Zeros intentionally prevent auto-fill rather than asserting that the components are absent.

```ts
import { makeCurrentShaftEntries, type CurrentShaftEntry } from './types'

export const PANDARUS_CURRENT_SHAFTS: CurrentShaftEntry[] = makeCurrentShaftEntries(
  { manufacturer: 'Pandarus', model: 'ELITE CA320', useCategory: 'target', sourceId: 'pandarus_2026_elite_ca320' },
  [
    ['325', 0.2291, 32, 0.325, 9.2, 0, 0, 0],
    ['350', 0.2248, 32, 0.35, 8.9, 0, 0, 0],
    ['380', 0.2193, 32, 0.38, 8.68, 0, 0, 0],
    ['410', 0.2157, 32, 0.41, 8.6, 0, 0, 0],
    ['450', 0.2087, 32, 0.45, 8.12, 0, 0, 0],
    ['500', 0.2071, 32, 0.5, 7.81, 0, 0, 0],
    ['550', 0.2055, 32, 0.55, 7.62, 0, 0, 0],
    ['600', 0.2008, 30, 0.6, 7.06, 0, 0, 0],
    ['650', 0.1972, 30, 0.65, 6.8, 0, 0, 0],
    ['700', 0.1937, 29, 0.7, 6.5, 0, 0, 0],
    ['750', 0.1929, 29, 0.75, 6.44, 0, 0, 0],
    ['830', 0.1917, 29, 0.83, 6.2, 0, 0, 0],
    ['900', 0.185, 28, 0.9, 6.06, 0, 0, 0],
    ['1000', 0.1839, 28, 1, 5.5, 0, 0, 0],
  ],
)
```

- [ ] **Step 4: Run and commit the Pandarus data**

Run: `pnpm test -- src/data/equipment/currentShaftData/pandarus.test.ts`

Expected: PASS, 1 test.

```bash
git add src/data/equipment/currentShaftData/pandarus.ts src/data/equipment/currentShaftData/pandarus.test.ts
git commit -m "feat(data): add current Pandarus shaft specs"
```

## Task 11: Aggregate, validate, and publish the merged catalog

**Files:**
- Create: `src/data/equipment/currentShaftData/index.ts`
- Create: `src/data/equipment/currentShaftDatabase.ts`
- Create: `src/data/equipment/currentShaftDatabase.test.ts`
- Modify: `src/data/equipment/shaftCatalog.ts`
- Modify: `src/data/equipment/shaftCatalog.test.ts`

- [ ] **Step 1: Add failing aggregate integrity tests**

```ts
import { describe, expect, it } from 'vitest'
import { CURRENT_SHAFT_SOURCES } from './currentShaftSources'
import { CURRENT_SHAFT_DATABASE } from './currentShaftDatabase'
import { SHAFT_CATALOG, shaftKey } from './shaftCatalog'

describe('current shaft database', () => {
  it('contains 134 verified variants from seven manufacturers', () => {
    expect(CURRENT_SHAFT_DATABASE).toHaveLength(134)
    expect(new Set(CURRENT_SHAFT_DATABASE.map((entry) => entry.manufacturer))).toEqual(new Set([
      'Easton', 'Victory Archery', 'Gold Tip', 'Black Eagle', 'Skylon', 'FIVICS', 'Pandarus',
    ]))
  })

  it('has valid numeric values, source IDs, categories, and unique keys', () => {
    for (const entry of CURRENT_SHAFT_DATABASE) {
      expect(CURRENT_SHAFT_SOURCES[entry.sourceId]).toBeDefined()
      expect(['base', 'hunting', 'target']).toContain(entry.useCategory)
      expect(Number.isFinite(entry.od) && entry.od > 0).toBe(true)
      expect(Number.isFinite(entry.stockLength) && entry.stockLength > 0).toBe(true)
      expect(Number.isFinite(entry.spine) && entry.spine > 0).toBe(true)
      expect(Number.isFinite(entry.gpi) && entry.gpi > 0).toBe(true)
      expect(entry.pointInsert).toBeGreaterThanOrEqual(0)
      expect(entry.bushingPin).toBeGreaterThanOrEqual(0)
      expect(entry.nockWeight).toBeGreaterThanOrEqual(0)
    }

    const keys = CURRENT_SHAFT_DATABASE.map(shaftKey)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('publishes a unique merged catalog with current precedence', () => {
    const keys = SHAFT_CATALOG.map(shaftKey)
    expect(new Set(keys).size).toBe(keys.length)

    expect(SHAFT_CATALOG.find((entry) =>
      entry.manufacturer === 'Gold Tip' && entry.model === 'Kinetic Pierce Tour' && entry.size === '700',
    )).toMatchObject({ spine: 0.7, gpi: 5.5 })

    expect(SHAFT_CATALOG.find((entry) =>
      entry.manufacturer === 'Victory Archery' && entry.model === '3DHV Elite' && entry.size === '400-FB',
    )).toBeDefined()
  })
})
```

- [ ] **Step 2: Run the aggregate test and verify that imports fail**

Run: `pnpm test -- src/data/equipment/currentShaftDatabase.test.ts`

Expected: FAIL because the aggregate modules and `SHAFT_CATALOG` export do not exist.

- [ ] **Step 3: Create the current-data aggregate**

`src/data/equipment/currentShaftData/index.ts`:

```ts
import { BLACK_EAGLE_CURRENT_SHAFTS } from './blackEagle'
import { EASTON_CURRENT_SHAFTS } from './easton'
import { FIVICS_CURRENT_SHAFTS } from './fivics'
import { GOLD_TIP_CURRENT_SHAFTS } from './goldTip'
import { PANDARUS_CURRENT_SHAFTS } from './pandarus'
import { SKYLON_CURRENT_SHAFTS } from './skylon'
import { VICTORY_CURRENT_SHAFTS } from './victory'
import type { CurrentShaftEntry } from './types'

export const CURRENT_SHAFT_DATABASE: CurrentShaftEntry[] = [
  ...EASTON_CURRENT_SHAFTS,
  ...VICTORY_CURRENT_SHAFTS,
  ...GOLD_TIP_CURRENT_SHAFTS,
  ...BLACK_EAGLE_CURRENT_SHAFTS,
  ...SKYLON_CURRENT_SHAFTS,
  ...FIVICS_CURRENT_SHAFTS,
  ...PANDARUS_CURRENT_SHAFTS,
]
```

`src/data/equipment/currentShaftDatabase.ts`:

```ts
export { CURRENT_SHAFT_DATABASE } from './currentShaftData'
```

- [ ] **Step 4: Publish the merged export from `shaftCatalog.ts`**

Add these imports at the top:

```ts
import { CURRENT_SHAFT_DATABASE } from './currentShaftDatabase'
import { SHAFT_DATABASE as LEGACY_SHAFT_DATABASE } from './shaftDatabase'
```

Add this export after `mergeShaftCatalog`:

```ts
export const SHAFT_CATALOG: ShaftEntry[] = mergeShaftCatalog(
  LEGACY_SHAFT_DATABASE,
  CURRENT_SHAFT_DATABASE,
)
```

- [ ] **Step 5: Run all equipment data tests**

Run: `pnpm test -- src/data/equipment`

Expected: PASS, including the existing equipment database tests and every new current-catalog test.

- [ ] **Step 6: Commit the public catalog**

```bash
git add src/data/equipment/currentShaftData/index.ts src/data/equipment/currentShaftDatabase.ts src/data/equipment/currentShaftDatabase.test.ts src/data/equipment/shaftCatalog.ts src/data/equipment/shaftCatalog.test.ts
git commit -m "feat(data): publish verified merged shaft catalog"
```

## Task 12: Load the merged catalog in the database panel

**Files:**
- Create: `src/components/loadShaftCatalog.ts`
- Create: `src/components/DatabasePanel.test.ts`
- Modify: `src/components/DatabasePanel.tsx`

- [ ] **Step 1: Add failing Node tests for the catalog loader**

```ts
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
```

- [ ] **Step 2: Run the loader test and verify that it fails**

Run: `pnpm test -- src/components/DatabasePanel.test.ts`

Expected: FAIL because `./loadShaftCatalog` does not exist.

- [ ] **Step 3: Create the single-flight dynamic loader**

`src/components/loadShaftCatalog.ts`:

```ts
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
```

Concurrent callers receive the same promise. A rejection clears the cached in-flight promise so the retry button can initiate a fresh dynamic import.

- [ ] **Step 4: Wire the guarded loader into `DatabasePanel`**

Import `useRef` and the loader, initialize the state as `loading`, and replace the inline database import with this guarded effect:

```ts
const [db, setDb] = useState<DatabaseState>({ status: 'loading' })
const catalogLoadInFlight = useRef(false)

useEffect(() => {
  if (open && db.status === 'loading' && !catalogLoadInFlight.current) {
    catalogLoadInFlight.current = true
    loadShaftCatalog().then((shafts) => {
      setDb({ status: 'ready', shafts })
    }).catch(() => {
      setDb({ status: 'error' })
    }).finally(() => {
      catalogLoadInFlight.current = false
    })
  }
}, [open, db.status])
```

The panel-level `useRef` guard prevents duplicate result handlers while the loader-level single-flight guarantee prevents duplicate catalog imports. Keep the retry action as `setDb({ status: 'loading' })` so a rejected load can run again.

- [ ] **Step 5: Run the focused tests and production build**

Run:

```bash
pnpm test -- src/components/DatabasePanel.test.ts src/data/equipment
pnpm run build
```

Expected: the Node loader tests and all equipment tests PASS, and the Vite production build succeeds.

- [ ] **Step 6: Commit the guarded UI loader**

```bash
git add src/components/loadShaftCatalog.ts src/components/DatabasePanel.test.ts src/components/DatabasePanel.tsx
git commit -m "feat(ui): load merged current shaft catalog"
```

## Task 13: Complete verification and smoke testing

**Files:**
- Verify only; no planned file changes.

- [ ] **Step 1: Run the full automated suite**

Run:

```bash
pnpm test
pnpm run lint
pnpm run build
git diff --check
```

Expected: all tests PASS, ESLint exits 0, the production build succeeds, and `git diff --check` prints no errors.

- [ ] **Step 2: Smoke-test a new hunting row**

Run: `pnpm dev`

In the database panel select `Easton` → `5.0` → `340`. Confirm the preview shows spine `0.34`, GPI `7.5`, length `32`, OD `0.258`, and nock `8gr`. Apply it and confirm the form receives those values while insert weight remains unchanged because the catalog value is `0`.

- [ ] **Step 3: Smoke-test a corrected target row**

Select `Gold Tip` → `Kinetic Pierce Tour` → `700`. Confirm the preview shows spine `0.7`, GPI `5.5`, length `30`, and OD `0.213`. Apply it and confirm no component weights are overwritten because the official product sells them separately.

- [ ] **Step 4: Smoke-test new manufacturers**

Confirm that `FIVICS` → `FIVE-X` → `350` and `Pandarus` → `ELITE CA320` → `325` are both selectable and populate their published shaft geometry.

- [ ] **Step 5: Inspect the final change set**

Run: `git status --short && git log --oneline -12`

Expected: only intentional current-catalog files are changed, and each completed task has its focused commit.
