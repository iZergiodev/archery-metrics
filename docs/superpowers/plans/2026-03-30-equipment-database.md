# Equipment Database Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a modal panel that lets users select shaft, fletching, and nock from SFAX databases to auto-fill arrow build fields.

**Architecture:** A Node script parses three SFAX CSVs into typed TypeScript arrays committed to `src/data/equipment/`. A new `DatabasePanel` component loads them lazily via dynamic `import()` and presents cascading dropdowns. On apply, selected data maps to existing form fields with a confirmation dialog if fields already have data.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Vite 7 (code-splitting), Vitest, lucide-react icons.

---

### Task 1: Types and CSV parser script

**Files:**
- Create: `src/data/equipment/types.ts`
- Create: `scripts/generateDatabases.ts`

- [ ] **Step 1: Create the shared types file**

Create `src/data/equipment/types.ts`:

```ts
export type ShaftEntry = {
  manufacturer: string
  model: string
  size: string
  useCategory: 'base' | 'hunting' | 'target'
  od: number
  stockLength: number
  spine: number
  gpi: number
  pointInsert: number
  bushingPin: number
  nockWeight: number
}

export type FletchEntry = {
  manufacturer: string
  model: string
  weight: number
  length: number
  height: number
  type: string
}

export type NockEntry = {
  manufacturer: string
  model: string
  weight: number
  bushingPin: number
}
```

- [ ] **Step 2: Create the CSV parser script**

Create `scripts/generateDatabases.ts`. This script reads the 3 CSVs from `scripts/sfax-databases/` and writes typed `.ts` files to `src/data/equipment/`.

```ts
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_DIR = resolve(__dirname, 'sfax-databases')
const OUT_DIR = resolve(__dirname, '..', 'src', 'data', 'equipment')

function mapUseCategory(code: string): 'base' | 'hunting' | 'target' {
  const first = code.charAt(0).toUpperCase()
  if (first === 'H') return 'hunting'
  if (first === 'T') return 'target'
  return 'base'
}

function parseShafts(): string {
  const raw = readFileSync(resolve(CSV_DIR, 'dec-ShaftData.csv'), 'utf-8')
  const lines = raw.split('\n')
  let manufacturer = ''
  const entries: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('*,') || trimmed.startsWith('=,') || trimmed.startsWith('--')) continue
    if (trimmed.startsWith('-,')) {
      const name = trimmed.slice(2).trim()
      if (name !== 'EOF') manufacturer = name
      continue
    }
    const parts = trimmed.split(',')
    if (parts.length < 10) continue
    const [model, size, use, od, stklen, spine, gpi, pi, bpc, stdn] = parts
    entries.push(
      `  { manufacturer: ${JSON.stringify(manufacturer)}, model: ${JSON.stringify(model.trim())}, size: ${JSON.stringify(size.trim())}, useCategory: ${JSON.stringify(mapUseCategory(use.trim()))}, od: ${parseFloat(od)}, stockLength: ${parseFloat(stklen)}, spine: ${parseFloat(spine)}, gpi: ${parseFloat(gpi)}, pointInsert: ${parseFloat(pi)}, bushingPin: ${parseFloat(bpc)}, nockWeight: ${parseFloat(stdn)} }`
    )
  }

  return `import type { ShaftEntry } from './types'\n\nexport const SHAFT_DATABASE: ShaftEntry[] = [\n${entries.join(',\n')},\n]\n`
}

function parseFletches(): string {
  const raw = readFileSync(resolve(CSV_DIR, 'dec-FletchData.csv'), 'utf-8')
  const lines = raw.split('\n')
  let manufacturer = ''
  const entries: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('*,') || trimmed.startsWith('=,') || trimmed.startsWith('--')) continue
    if (trimmed.startsWith('-,')) {
      const name = trimmed.slice(2).trim()
      if (name !== 'EOF') manufacturer = name
      continue
    }
    const parts = trimmed.split(',')
    if (parts.length < 5) continue
    const [model, weight, length, height, ftype] = parts
    entries.push(
      `  { manufacturer: ${JSON.stringify(manufacturer)}, model: ${JSON.stringify(model.trim())}, weight: ${parseFloat(weight)}, length: ${parseFloat(length)}, height: ${parseFloat(height)}, type: ${JSON.stringify((ftype ?? 'Vane').trim())} }`
    )
  }

  return `import type { FletchEntry } from './types'\n\nexport const FLETCH_DATABASE: FletchEntry[] = [\n${entries.join(',\n')},\n]\n`
}

function parseNocks(): string {
  const raw = readFileSync(resolve(CSV_DIR, 'dec-NockData.csv'), 'utf-8')
  const lines = raw.split('\n')
  let manufacturer = ''
  const entries: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('*,') || trimmed.startsWith('=,') || trimmed.startsWith('--')) continue
    if (trimmed.startsWith('-,')) {
      const name = trimmed.slice(2).trim()
      if (name !== 'EOF') manufacturer = name
      continue
    }
    const parts = trimmed.split(',')
    if (parts.length < 3) continue
    const [model, weight, bushingPin] = parts
    entries.push(
      `  { manufacturer: ${JSON.stringify(manufacturer)}, model: ${JSON.stringify(model.trim())}, weight: ${parseFloat(weight)}, bushingPin: ${parseFloat(bushingPin)} }`
    )
  }

  return `import type { NockEntry } from './types'\n\nexport const NOCK_DATABASE: NockEntry[] = [\n${entries.join(',\n')},\n]\n`
}

writeFileSync(resolve(OUT_DIR, 'shaftDatabase.ts'), parseShafts())
writeFileSync(resolve(OUT_DIR, 'fletchDatabase.ts'), parseFletches())
writeFileSync(resolve(OUT_DIR, 'nockDatabase.ts'), parseNocks())

console.log('Generated shaft, fletch, and nock databases.')
```

- [ ] **Step 3: Run the generator and verify output**

Run: `npx tsx scripts/generateDatabases.ts`

Expected: Three files created in `src/data/equipment/`:
- `shaftDatabase.ts` with `SHAFT_DATABASE` array
- `fletchDatabase.ts` with `FLETCH_DATABASE` array
- `nockDatabase.ts` with `NOCK_DATABASE` array

Verify with: `head -5 src/data/equipment/shaftDatabase.ts` and `grep -c "manufacturer" src/data/equipment/shaftDatabase.ts` (should be ~3800+)

- [ ] **Step 4: Verify build still passes**

Run: `npx vite build`

Expected: Build succeeds. The new files are valid TypeScript.

- [ ] **Step 5: Commit**

```bash
git add src/data/equipment/types.ts scripts/generateDatabases.ts src/data/equipment/shaftDatabase.ts src/data/equipment/fletchDatabase.ts src/data/equipment/nockDatabase.ts
git commit -m "feat: add equipment database types and CSV parser with generated data"
```

---

### Task 2: Database integrity tests

**Files:**
- Create: `src/data/equipment/equipmentDatabase.test.ts`

- [ ] **Step 1: Write integrity tests for all three databases**

Create `src/data/equipment/equipmentDatabase.test.ts`:

```ts
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
      expect(entry.stockLength).toBeGreaterThan(0)
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
      expect(entry.weight).toBeGreaterThan(0)
      expect(entry.length).toBeGreaterThan(0)
      expect(entry.height).toBeGreaterThan(0)
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
      expect(entry.weight).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run the tests**

Run: `npx vitest run src/data/equipment/equipmentDatabase.test.ts`

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/data/equipment/equipmentDatabase.test.ts
git commit -m "test: add equipment database integrity tests"
```

---

### Task 3: i18n keys

**Files:**
- Modify: `src/i18n.tsx`

- [ ] **Step 1: Add Spanish keys**

In `src/i18n.tsx`, add these keys inside the `es` object, after the `'option.cam.hard'` entry (line 183):

```ts
        'db.title': 'Base de datos de equipamiento',
        'db.button': 'Buscar en base de datos',
        'db.section.shaft': 'Shaft',
        'db.section.fletching': 'Fletching',
        'db.section.nock': 'Nock',
        'db.selectManufacturer': 'Selecciona fabricante',
        'db.selectModel': 'Selecciona modelo',
        'db.selectVariant': 'Selecciona variante',
        'db.preview': 'Vista previa',
        'db.apply': 'Aplicar seleccion',
        'db.cancel': 'Cancelar',
        'db.confirm': 'Esto reemplazara tus datos actuales de flecha. ¿Continuar?',
        'db.noResults': 'Sin resultados',
        'db.loading': 'Cargando base de datos...',
```

- [ ] **Step 2: Add English keys**

Add these keys inside the `en` object, after the `'option.cam.hard'` entry (line 356):

```ts
        'db.title': 'Equipment database',
        'db.button': 'Search database',
        'db.section.shaft': 'Shaft',
        'db.section.fletching': 'Fletching',
        'db.section.nock': 'Nock',
        'db.selectManufacturer': 'Select manufacturer',
        'db.selectModel': 'Select model',
        'db.selectVariant': 'Select variant',
        'db.preview': 'Preview',
        'db.apply': 'Apply selection',
        'db.cancel': 'Cancel',
        'db.confirm': 'This will replace your current arrow data. Continue?',
        'db.noResults': 'No results',
        'db.loading': 'Loading database...',
```

- [ ] **Step 3: Verify build**

Run: `npx vite build`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/i18n.tsx
git commit -m "feat: add i18n keys for equipment database panel"
```

---

### Task 4: DatabasePanel component

**Files:**
- Create: `src/components/DatabasePanel.tsx`

- [ ] **Step 1: Create the DatabasePanel component**

Create `src/components/DatabasePanel.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Search, X, Loader } from 'lucide-react'
import type { ShaftEntry, FletchEntry, NockEntry } from '../data/equipment/types'

interface DatabasePanelProps {
  open: boolean
  onClose: () => void
  onApply: (selection: DatabaseSelection) => void
  hasExistingData: boolean
  t: (key: string) => string
}

export interface DatabaseSelection {
  shaft: ShaftEntry | null
  fletch: FletchEntry | null
  nock: NockEntry | null
}

type DatabaseState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; shafts: ShaftEntry[]; fletches: FletchEntry[]; nocks: NockEntry[] }

export function DatabasePanel({ open, onClose, onApply, hasExistingData, t }: DatabasePanelProps) {
  const [db, setDb] = useState<DatabaseState>({ status: 'idle' })
  const [shaftMfg, setShaftMfg] = useState('')
  const [shaftModel, setShaftModel] = useState('')
  const [shaftSize, setShaftSize] = useState('')
  const [fletchMfg, setFletchMfg] = useState('')
  const [fletchModel, setFletchModel] = useState('')
  const [nockMfg, setNockMfg] = useState('')
  const [nockModel, setNockModel] = useState('')
  const [shaftOpen, setShaftOpen] = useState(true)
  const [fletchOpen, setFletchOpen] = useState(false)
  const [nockOpen, setNockOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (open && db.status === 'idle') {
      setDb({ status: 'loading' })
      Promise.all([
        import('../data/equipment/shaftDatabase'),
        import('../data/equipment/fletchDatabase'),
        import('../data/equipment/nockDatabase'),
      ]).then(([shaftMod, fletchMod, nockMod]) => {
        setDb({
          status: 'ready',
          shafts: shaftMod.SHAFT_DATABASE,
          fletches: fletchMod.FLETCH_DATABASE,
          nocks: nockMod.NOCK_DATABASE,
        })
      })
    }
  }, [open, db.status])

  const shaftManufacturers = useMemo(() => {
    if (db.status !== 'ready') return []
    return [...new Set(db.shafts.map((s) => s.manufacturer))].sort()
  }, [db])

  const shaftModels = useMemo(() => {
    if (db.status !== 'ready' || !shaftMfg) return []
    return [...new Set(db.shafts.filter((s) => s.manufacturer === shaftMfg).map((s) => s.model))].sort()
  }, [db, shaftMfg])

  const shaftSizes = useMemo(() => {
    if (db.status !== 'ready' || !shaftMfg || !shaftModel) return []
    return db.shafts
      .filter((s) => s.manufacturer === shaftMfg && s.model === shaftModel)
      .map((s) => s.size)
  }, [db, shaftMfg, shaftModel])

  const selectedShaft = useMemo(() => {
    if (db.status !== 'ready' || !shaftSize) return null
    return db.shafts.find(
      (s) => s.manufacturer === shaftMfg && s.model === shaftModel && s.size === shaftSize,
    ) ?? null
  }, [db, shaftMfg, shaftModel, shaftSize])

  const fletchManufacturers = useMemo(() => {
    if (db.status !== 'ready') return []
    return [...new Set(db.fletches.map((f) => f.manufacturer))].sort()
  }, [db])

  const fletchModels = useMemo(() => {
    if (db.status !== 'ready' || !fletchMfg) return []
    return db.fletches.filter((f) => f.manufacturer === fletchMfg)
  }, [db, fletchMfg])

  const selectedFletch = useMemo(() => {
    if (db.status !== 'ready' || !fletchModel) return null
    return db.fletches.find(
      (f) => f.manufacturer === fletchMfg && f.model === fletchModel,
    ) ?? null
  }, [db, fletchMfg, fletchModel])

  const nockManufacturers = useMemo(() => {
    if (db.status !== 'ready') return []
    return [...new Set(db.nocks.map((n) => n.manufacturer))].sort()
  }, [db])

  const nockModels = useMemo(() => {
    if (db.status !== 'ready' || !nockMfg) return []
    return db.nocks.filter((n) => n.manufacturer === nockMfg)
  }, [db, nockMfg])

  const selectedNock = useMemo(() => {
    if (db.status !== 'ready' || !nockModel) return null
    return db.nocks.find(
      (n) => n.manufacturer === nockMfg && n.model === nockModel,
    ) ?? null
  }, [db, nockMfg, nockModel])

  const hasSelection = selectedShaft !== null || selectedFletch !== null || selectedNock !== null

  const resetSelections = () => {
    setShaftMfg('')
    setShaftModel('')
    setShaftSize('')
    setFletchMfg('')
    setFletchModel('')
    setNockMfg('')
    setNockModel('')
    setShaftOpen(true)
    setFletchOpen(false)
    setNockOpen(false)
    setShowConfirm(false)
  }

  const handleClose = () => {
    resetSelections()
    onClose()
  }

  const handleApply = () => {
    onApply({ shaft: selectedShaft, fletch: selectedFletch, nock: selectedNock })
    resetSelections()
    onClose()
  }

  const handleApplyClick = () => {
    if (hasExistingData) {
      setShowConfirm(true)
    } else {
      handleApply()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[560px] px-4 py-4">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-[var(--gold)]">{t('db.title')}</h2>
            <button onClick={handleClose} className="rounded-full p-2 text-[var(--text-secondary)] transition-colors press-scale hover:text-[var(--text-primary)]">
              <X size={20} />
            </button>
          </div>

          {db.status === 'loading' && (
            <div className="flex items-center gap-3 py-12 text-[var(--text-secondary)]">
              <Loader size={18} className="animate-spin" />
              <span className="text-[13px]">{t('db.loading')}</span>
            </div>
          )}

          {db.status === 'ready' && (
            <div className="space-y-4">
              {/* Shaft section */}
              <CollapsibleSection title={t('db.section.shaft')} open={shaftOpen} onToggle={() => setShaftOpen((o) => !o)}>
                <div className="space-y-3">
                  <PanelSelect
                    label={t('db.selectManufacturer')}
                    value={shaftMfg}
                    onChange={(v) => { setShaftMfg(v); setShaftModel(''); setShaftSize('') }}
                    options={shaftManufacturers.map((m) => ({ value: m, label: m }))}
                  />
                  <PanelSelect
                    label={t('db.selectModel')}
                    value={shaftModel}
                    onChange={(v) => { setShaftModel(v); setShaftSize('') }}
                    options={shaftModels.map((m) => ({ value: m, label: m }))}
                    disabled={!shaftMfg}
                  />
                  <PanelSelect
                    label={t('db.selectVariant')}
                    value={shaftSize}
                    onChange={setShaftSize}
                    options={shaftSizes.map((s) => ({ value: s, label: s }))}
                    disabled={!shaftModel}
                  />
                  {selectedShaft && (
                    <PreviewCard>
                      <PreviewRow label="Spine" value={selectedShaft.spine.toString()} />
                      <PreviewRow label="GPI" value={`${selectedShaft.gpi}`} />
                      <PreviewRow label="Length" value={`${selectedShaft.stockLength}"`} />
                      <PreviewRow label="OD" value={`${selectedShaft.od}"`} />
                      {selectedShaft.nockWeight > 0 && <PreviewRow label="Nock" value={`${selectedShaft.nockWeight}gr`} />}
                      {selectedShaft.bushingPin > 0 && <PreviewRow label="Bushing" value={`${selectedShaft.bushingPin}gr`} />}
                      {selectedShaft.pointInsert > 0 && <PreviewRow label="Insert" value={`${selectedShaft.pointInsert}gr`} />}
                    </PreviewCard>
                  )}
                </div>
              </CollapsibleSection>

              {/* Fletching section */}
              <CollapsibleSection title={t('db.section.fletching')} open={fletchOpen} onToggle={() => setFletchOpen((o) => !o)}>
                <div className="space-y-3">
                  <PanelSelect
                    label={t('db.selectManufacturer')}
                    value={fletchMfg}
                    onChange={(v) => { setFletchMfg(v); setFletchModel('') }}
                    options={fletchManufacturers.map((m) => ({ value: m, label: m }))}
                  />
                  <PanelSelect
                    label={t('db.selectModel')}
                    value={fletchModel}
                    onChange={setFletchModel}
                    options={fletchModels.map((f) => ({ value: f.model, label: f.model }))}
                    disabled={!fletchMfg}
                  />
                  {selectedFletch && (
                    <PreviewCard>
                      <PreviewRow label="Weight" value={`${selectedFletch.weight}gr`} />
                      <PreviewRow label="Length" value={`${selectedFletch.length}"`} />
                      <PreviewRow label="Height" value={`${selectedFletch.height}"`} />
                      <PreviewRow label="Type" value={selectedFletch.type} />
                    </PreviewCard>
                  )}
                </div>
              </CollapsibleSection>

              {/* Nock section */}
              <CollapsibleSection title={t('db.section.nock')} open={nockOpen} onToggle={() => setNockOpen((o) => !o)}>
                <div className="space-y-3">
                  <PanelSelect
                    label={t('db.selectManufacturer')}
                    value={nockMfg}
                    onChange={(v) => { setNockMfg(v); setNockModel('') }}
                    options={nockManufacturers.map((m) => ({ value: m, label: m }))}
                  />
                  <PanelSelect
                    label={t('db.selectModel')}
                    value={nockModel}
                    onChange={setNockModel}
                    options={nockModels.map((n) => ({ value: n.model, label: n.model }))}
                    disabled={!nockMfg}
                  />
                  {selectedNock && (
                    <PreviewCard>
                      <PreviewRow label="Weight" value={`${selectedNock.weight}gr`} />
                      {selectedNock.bushingPin > 0 && <PreviewRow label="Bushing" value={`${selectedNock.bushingPin}gr`} />}
                    </PreviewCard>
                  )}
                </div>
              </CollapsibleSection>

              {/* Apply button */}
              <button
                onClick={handleApplyClick}
                disabled={!hasSelection}
                className={`mt-4 w-full rounded-[14px] py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-all duration-150 press-scale ${
                  hasSelection
                    ? 'bg-[var(--gold)] text-[var(--bg-primary)] hover:bg-[var(--gold-light)]'
                    : 'cursor-not-allowed bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                }`}
              >
                {t('db.apply')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-[360px] rounded-[14px] border border-[var(--border)] p-5 card-surface animate-fade-in">
            <p className="text-[14px] leading-relaxed text-[var(--text-primary)]">{t('db.confirm')}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-[12px] border border-[var(--border)] py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--text-secondary)] transition-colors press-scale hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              >
                {t('db.cancel')}
              </button>
              <button
                onClick={handleApply}
                className="rounded-[12px] bg-[var(--gold)] py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--bg-primary)] transition-colors press-scale hover:bg-[var(--gold-light)]"
              >
                {t('db.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] card-surface">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors press-scale hover:bg-[var(--bg-elevated)]"
      >
        <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{title}</span>
        <span className="text-[var(--text-secondary)] transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={16} strokeWidth={2} />
        </span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function PanelSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ colorScheme: 'dark' }}
        className={`w-full cursor-pointer appearance-none rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 pr-10 text-[14px] transition-colors focus:border-[var(--ring-gold)] focus:outline-none ${
          disabled
            ? 'cursor-not-allowed text-[var(--text-muted)] opacity-50'
            : value
              ? 'text-[var(--text-primary)] hover:border-[var(--gold)]/40'
              : 'text-[var(--text-secondary)] hover:border-[var(--gold)]/40'
        }`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
        <ChevronDown size={16} strokeWidth={2} />
      </span>
    </div>
  )
}

function PreviewCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-3 py-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</span>
      <span className="font-mono text-[13px] text-[var(--text-primary)]">{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatabasePanel.tsx
git commit -m "feat: add DatabasePanel component with cascading selectors"
```

---

### Task 5: Integrate DatabasePanel into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add state and import**

At the top of `src/App.tsx`, add the import after the existing component imports:

```ts
import { DatabasePanel, type DatabaseSelection } from './components/DatabasePanel'
```

Inside the `App` function, after the `const [stringWeights, setStringWeights] = useState(initialStringWeights)` line, add:

```ts
const [dbPanelOpen, setDbPanelOpen] = useState(false)
```

- [ ] **Step 2: Add the applyDatabaseSelection handler**

Inside the `App` function, after the `clearInputs` function, add:

```ts
  const applyDatabaseSelection = (selection: DatabaseSelection) => {
    if (selection.shaft) {
      const s = selection.shaft
      setArrowSpecs((current) => ({
        ...current,
        staticSpine: s.spine.toString(),
        shaftGpi: s.gpi.toString(),
        shaftLength: s.stockLength.toString(),
        shaftUseCategory: s.useCategory,
        ...(s.nockWeight > 0 ? { nockWeight: s.nockWeight.toString() } : {}),
        ...(s.bushingPin > 0 ? { bushingPin: s.bushingPin.toString() } : {}),
        ...(s.pointInsert > 0 ? { insertWeight: s.pointInsert.toString() } : {}),
      }))
    }
    if (selection.fletch) {
      const f = selection.fletch
      setArrowSpecs((current) => ({
        ...current,
        weightEach: f.weight.toString(),
        fletchLength: f.length.toString(),
        fletchHeight: f.height.toString(),
        ...(current.fletchQuantity.trim() === '' ? { fletchQuantity: '3' } : {}),
      }))
    }
    if (selection.nock) {
      const n = selection.nock
      setArrowSpecs((current) => ({
        ...current,
        nockWeight: n.weight.toString(),
        ...(n.bushingPin > 0 ? { bushingPin: n.bushingPin.toString() } : {}),
      }))
    }
  }
```

- [ ] **Step 3: Add the database button to the arrow section**

In the `renderArrowSection` function, add a database button before the first `<FieldGroup>`. Find the line:

```tsx
      <FieldGroup title={t('group.core')}>
```

And add this button block before it:

```tsx
      <button
        onClick={() => setDbPanelOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-[var(--gold)]/30 bg-[var(--gold)]/5 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--gold)] transition-all duration-150 press-scale hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10"
      >
        <Search size={14} />
        {t('db.button')}
      </button>
```

Also add the `Search` import from lucide-react at the top of `App.tsx`:

```ts
import { Search } from 'lucide-react'
```

- [ ] **Step 4: Render the DatabasePanel**

Inside the JSX return, just before the closing `</div>` of the root element (before the sticky bottom bar), add:

```tsx
      <DatabasePanel
        open={dbPanelOpen}
        onClose={() => setDbPanelOpen(false)}
        onApply={applyDatabaseSelection}
        hasExistingData={arrowSpecs.staticSpine.trim() !== '' || arrowSpecs.shaftGpi.trim() !== '' || arrowSpecs.shaftLength.trim() !== ''}
        t={t}
      />
```

- [ ] **Step 5: Verify build**

Run: `npx vite build`

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate DatabasePanel into arrow section with apply logic"
```

---

### Task 6: Manual smoke test and final verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`

Expected: All tests pass (existing 29 + new equipment database tests).

- [ ] **Step 2: Build for production**

Run: `npx vite build`

Expected: Build succeeds. Check that the equipment database chunks are code-split (look for multiple `.js` files in the output).

- [ ] **Step 3: Smoke test in browser**

Run: `npx vite dev`

Manual verification:
1. Open the app in a browser
2. Go to the Arrow tab
3. Click "Search database" / "Buscar en base de datos" button
4. Verify the panel opens with a loading spinner then shows the 3 sections
5. Select Shaft: "Victory Archery" -> "3DHV Elite" -> "400-FB"
6. Verify preview shows Spine: 0.4, GPI: 5.9, Length: 30.5", Nock: 6gr, Bushing: 8gr
7. Click "Apply selection" -> confirm dialog appears -> confirm
8. Verify form fields are populated: staticSpine=0.400, shaftGpi=5.9, shaftLength=30.5, nockWeight=6, bushingPin=8
9. Verify the spine calculation updates with the new data
10. Open panel again, select a fletching and nock, apply, verify fields update

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: equipment database panel - complete implementation"
```
