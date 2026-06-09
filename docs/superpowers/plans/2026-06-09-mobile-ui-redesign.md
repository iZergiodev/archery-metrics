# Mobile UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la UI de archery-metrics como app shell móvil (navegación inferior, bottom sheets, header compacto, tipografía empaquetada) sin tocar la lógica de cálculo.

**Architecture:** `App.tsx` pasa de "una columna con tabs arriba + resultados debajo" a un app shell con 4 vistas (`bow | arrow | string | results`) navegadas por una `BottomNav` fija; los menús (ajustes, base de datos) se sirven en un `BottomSheet` reutilizable. En escritorio (≥1024px, detectado con `matchMedia`) el shell cambia a dos columnas: formularios + tabs segmentados a la izquierda, resultados sticky a la derecha.

**Tech Stack:** React 19, Vite 7, Tailwind 4 (`@theme`), lucide-react, @fontsource. Gestor de paquetes: **pnpm**.

**Spec:** `docs/superpowers/specs/2026-06-09-mobile-ui-redesign-design.md`

**Nota sobre testing:** No se añaden tests unitarios nuevos: todos los cambios son presentacionales y el repo no tiene infraestructura de component-testing (montarla queda fuera de alcance). Cada tarea se verifica con `npm run build` (incluye `tsc -b`) y al final `npm run lint` + `npm test` (la suite de cálculo existente debe seguir verde).

---

### Task 1: Tipografía empaquetada, tokens y meta móvil

**Files:**
- Modify: `package.json` (vía pnpm)
- Modify: `src/main.tsx`
- Modify: `src/index.css:1-43`
- Modify: `index.html`

- [ ] **Step 1: Instalar fuentes**

Run: `pnpm add @fontsource-variable/archivo @fontsource/jetbrains-mono`
Expected: ambos paquetes añadidos a `dependencies` sin errores.

- [ ] **Step 2: Importar fuentes en `src/main.tsx`**

Añadir las tres primeras líneas (antes de `./index.css`):

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n.tsx'
```

El resto del archivo no cambia.

- [ ] **Step 3: Tokens de fuente en `src/index.css`**

Tras `@import "tailwindcss";` (línea 1) añadir un bloque `@theme` (Tailwind 4 — esto hace que las utilidades `font-sans`/`font-mono` usen estas pilas):

```css
@import "tailwindcss";

@theme {
  --font-sans: "Archivo Variable", "Segoe UI Variable", "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "Cascadia Mono", "Consolas", monospace;
}
```

En el bloque `html, body` reemplazar la línea `font-family: "Aptos", "Segoe UI Variable", "Segoe UI", sans-serif;` por:

```css
    font-family: var(--font-sans);
```

Y reemplazar el bloque de headings:

```css
  h1, h2, h3 {
    font-family: "Bahnschrift", "Aptos Display", "Segoe UI Variable", sans-serif;
  }
```

por:

```css
  h1, h2, h3 {
    font-family: var(--font-sans);
    letter-spacing: -0.01em;
  }
```

- [ ] **Step 4: Meta móvil en `index.html`**

Contenido completo del archivo:

```html
<!doctype html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#0B0B0B" />
  <title>Archery Metrics</title>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

(Se elimina el `<link href="/src/index.css">` — el CSS ya entra por `main.tsx`; se añade `viewport-fit=cover` y `theme-color`.)

- [ ] **Step 5: Verificar build**

Run: `npm run build`
Expected: éxito; el output de Vite incluye archivos `.woff2` de Archivo y JetBrains Mono.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/main.tsx src/index.css index.html
git commit -m "feat(ui): bundled Archivo/JetBrains Mono fonts and mobile meta"
```

---

### Task 2: Componente BottomSheet reutilizable

**Files:**
- Create: `src/components/BottomSheet.tsx`
- Modify: `src/index.css` (keyframes + utilidad)

- [ ] **Step 1: Crear `src/components/BottomSheet.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      triggerRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />
      <div className="relative z-10 mx-auto flex max-h-[88dvh] w-full max-w-[560px] flex-col rounded-t-[24px] border-x border-t border-[var(--border)] bg-[var(--bg-surface)] animate-sheet-up">
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[var(--border-hover)]" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors press-scale hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 safe-bottom">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Animación del sheet en `src/index.css`**

Junto a los demás `@keyframes` (tras `fadeIn`):

```css
@keyframes sheetUp {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Y dentro de `@layer utilities` (junto a `.animate-fade-in`):

```css
  .animate-sheet-up {
    animation: sheetUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both;
  }
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: éxito (el componente aún no se usa; TypeScript debe compilar).

- [ ] **Step 4: Commit**

```bash
git add src/components/BottomSheet.tsx src/index.css
git commit -m "feat(ui): reusable BottomSheet component with slide-up animation"
```

---

### Task 3: SettingsSheet (sustituye al menú del Toolbar)

**Files:**
- Create: `src/components/SettingsSheet.tsx`
- Modify: `src/i18n.tsx` (clave `settings.title` en ES y EN)

- [ ] **Step 1: Crear `src/components/SettingsSheet.tsx`**

(La lógica de `readSlotSummary` se copia de `Toolbar.tsx`, que se borrará en la Task 6.)

```tsx
import { useEffect, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import type { UnitSystem } from '../utils/unitSystem'

type SlotSummary = { drawWeight?: string; staticSpine?: string; filled: boolean }

function readSlotSummary(slot: number): SlotSummary {
  const saved = localStorage.getItem(`archery-config-${slot}`)
  if (!saved) return { filled: false }
  try {
    const config = JSON.parse(saved) as {
      bowSpecs?: { drawWeight?: string }
      arrowSpecs?: { staticSpine?: string }
    }
    const drawWeight = config.bowSpecs?.drawWeight?.trim()
    const staticSpine = config.arrowSpecs?.staticSpine?.trim()
    return {
      drawWeight: drawWeight || undefined,
      staticSpine: staticSpine || undefined,
      filled: Boolean(drawWeight || staticSpine),
    }
  } catch {
    return { filled: false }
  }
}

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  onSave: (slot: number) => void
  onLoad: (slot: number) => void
  onClear: () => void
  lang: 'es' | 'en'
  onSetLang: (lang: 'es' | 'en') => void
  unitSystem: UnitSystem
  onSetUnitSystem: (unitSystem: UnitSystem) => void
  t: (key: string) => string
}

export function SettingsSheet({
  open,
  onClose,
  onSave,
  onLoad,
  onClear,
  lang,
  onSetLang,
  unitSystem,
  onSetUnitSystem,
  t,
}: SettingsSheetProps) {
  const [slotSummaries, setSlotSummaries] = useState<SlotSummary[]>(() => [
    { filled: false },
    { filled: false },
    { filled: false },
  ])

  useEffect(() => {
    if (open) {
      setSlotSummaries([readSlotSummary(1), readSlotSummary(2), readSlotSummary(3)])
    }
  }, [open])

  const handleSave = (slot: number) => {
    onSave(slot)
    setSlotSummaries([readSlotSummary(1), readSlotSummary(2), readSlotSummary(3)])
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t('settings.title')}>
      <div className="space-y-6">
        <SheetSection title={t('toolbar.language')}>
          <SegmentedControl
            options={[
              { label: 'ES', active: lang === 'es', onClick: () => onSetLang('es') },
              { label: 'EN', active: lang === 'en', onClick: () => onSetLang('en') },
            ]}
          />
        </SheetSection>

        <SheetSection title={t('toolbar.units')}>
          <SegmentedControl
            options={[
              {
                label: t('option.units.imperial.short'),
                active: unitSystem === 'imperial',
                onClick: () => onSetUnitSystem('imperial'),
              },
              {
                label: t('option.units.metric.short'),
                active: unitSystem === 'metric',
                onClick: () => onSetUnitSystem('metric'),
              },
            ]}
          />
        </SheetSection>

        <SheetSection title={t('toolbar.save')}>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((slot) => (
              <SlotButton
                key={`save-${slot}`}
                slot={slot}
                summary={slotSummaries[slot - 1]}
                onClick={() => handleSave(slot)}
              />
            ))}
          </div>
        </SheetSection>

        <SheetSection title={t('toolbar.load')}>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((slot) => (
              <SlotButton
                key={`load-${slot}`}
                slot={slot}
                summary={slotSummaries[slot - 1]}
                disabled={!slotSummaries[slot - 1].filled}
                onClick={() => {
                  onLoad(slot)
                  onClose()
                }}
              />
            ))}
          </div>
        </SheetSection>

        <button
          type="button"
          onClick={() => {
            onClear()
            onClose()
          }}
          className="w-full rounded-[12px] border border-[var(--target-red)]/30 py-3 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--target-red)] transition-colors press-scale hover:border-[var(--target-red)]/60"
        >
          {t('toolbar.clearAll')}
        </button>
      </div>
    </BottomSheet>
  )
}

function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{title}</div>
      {children}
    </div>
  )
}

function SegmentedControl({
  options,
}: {
  options: Array<{ label: string; active: boolean; onClick: () => void }>
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-[12px] border border-[var(--border)] bg-[var(--bg-primary)] p-1">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={option.onClick}
          className={`min-h-11 w-full min-w-0 rounded-[9px] px-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 press-scale ${
            option.active
              ? 'bg-[var(--gold)] text-[var(--bg-primary)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="block truncate">{option.label}</span>
        </button>
      ))}
    </div>
  )
}

function SlotButton({
  slot,
  summary,
  disabled = false,
  onClick,
}: {
  slot: number
  summary: SlotSummary
  disabled?: boolean
  onClick: () => void
}) {
  const summaryLine = summary.filled
    ? [summary.drawWeight ? `${summary.drawWeight}#` : null, summary.staticSpine ?? null].filter(Boolean).join(' · ')
    : '—'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[10px] border border-[var(--border)] px-1 py-2 text-center transition-all duration-150 press-scale ${
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:border-[var(--gold)]/40 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
      }`}
    >
      <span className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">{slot}</span>
      <span className="w-full truncate font-mono text-[9px] leading-tight text-[var(--text-muted)]">{summaryLine}</span>
    </button>
  )
}
```

- [ ] **Step 2: Añadir clave i18n `settings.title`**

En `src/i18n.tsx`, dentro del bloque `es:` (tras `'app.progress': 'Campos clave',`) añadir:

```ts
        'settings.title': 'Ajustes',
```

Y en el bloque `en:` (tras la clave `'app.progress'` equivalente) añadir:

```ts
        'settings.title': 'Settings',
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: éxito.

- [ ] **Step 4: Commit**

```bash
git add src/components/SettingsSheet.tsx src/i18n.tsx
git commit -m "feat(ui): SettingsSheet with language/units/slots in a bottom sheet"
```

---

### Task 4: BottomNav, StatusStrip y SectionTabs

**Files:**
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/StatusStrip.tsx`
- Create: `src/components/SectionTabs.tsx`
- Modify: `src/i18n.tsx` (claves `nav.*` en ES y EN)

- [ ] **Step 1: Crear `src/components/BottomNav.tsx`**

```tsx
import { Crosshair, Feather, Spline, Target } from 'lucide-react'

export type NavTabId = 'bow' | 'arrow' | 'string' | 'results'

const NAV_ICONS = {
  bow: Crosshair,
  arrow: Feather,
  string: Spline,
  results: Target,
} as const

export interface BottomNavItem {
  id: NavTabId
  label: string
  complete?: boolean
  statusColor?: string | null
}

interface BottomNavProps {
  items: BottomNavItem[]
  activeTab: NavTabId
  onChange: (id: NavTabId) => void
  ariaLabel: string
}

export function BottomNav({ items, activeTab, onChange, ariaLabel }: BottomNavProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className="border-t border-[var(--border)] safe-bottom"
      style={{ backgroundColor: 'rgba(11,11,11,0.94)', backdropFilter: 'blur(16px)' }}
    >
      <div className="mx-auto grid max-w-[560px] grid-cols-4">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.id]
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 transition-colors duration-150 press-scale ${
                isActive ? 'text-[var(--gold)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <span
                className={`absolute inset-x-4 top-0 h-[2px] rounded-full bg-[var(--gold)] transition-opacity duration-150 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              />
              <span className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                {(item.complete || item.statusColor) && (
                  <span
                    className="absolute -right-1.5 -top-0.5 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.statusColor ?? 'var(--gold)' }}
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.08em]">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Crear `src/components/StatusStrip.tsx`**

```tsx
interface StatusStripProps {
  label: string
  matchIndex: number | null
  accentColor: string
  textClass: string
  onClick: () => void
  ariaLabel: string
}

export function StatusStrip({ label, matchIndex, accentColor, textClass, onClick, ariaLabel }: StatusStripProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="block w-full border-t border-[var(--border)] animate-slide-up-entry"
      style={{ backgroundColor: 'rgba(11,11,11,0.94)', backdropFilter: 'blur(16px)' }}
    >
      <div className="mx-auto flex h-11 max-w-[560px] items-center gap-3 px-4" style={{ borderLeft: `3px solid ${accentColor}` }}>
        <span
          className="inline-flex h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <span className={`text-[13px] font-semibold ${textClass}`}>{label}</span>
        <span className="ml-auto font-mono text-[13px] text-[var(--text-secondary)]">
          {matchIndex?.toFixed(3) ?? '--'}
        </span>
      </div>
    </button>
  )
}
```

- [ ] **Step 3: Crear `src/components/SectionTabs.tsx`** (solo escritorio)

```tsx
export type SectionTabId = 'bow' | 'arrow' | 'string'

export interface SectionTab {
  id: SectionTabId
  label: string
  detail: string
  complete: boolean
}

interface SectionTabsProps {
  tabs: SectionTab[]
  active: SectionTabId
  onChange: (id: SectionTabId) => void
}

export function SectionTabs({ tabs, active, onChange }: SectionTabsProps) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)] p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === active

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-[11px] px-3 text-[12px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 press-scale ${
              isActive
                ? 'bg-[var(--bg-elevated)] text-[var(--gold)] glow-gold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="truncate">{tab.label}</span>
            <span className={`font-mono text-[10px] ${tab.complete ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}>
              {tab.detail}
            </span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Añadir claves i18n `nav.*`**

En `src/i18n.tsx`, bloque `es:` (junto a `'settings.title'`):

```ts
        'nav.bow': 'Arco',
        'nav.arrow': 'Flecha',
        'nav.string': 'Cuerda',
        'nav.results': 'Resultados',
        'nav.aria': 'Navegación principal',
        'nav.viewResults': 'Ver resultados',
```

Bloque `en:`:

```ts
        'nav.bow': 'Bow',
        'nav.arrow': 'Arrow',
        'nav.string': 'String',
        'nav.results': 'Results',
        'nav.aria': 'Primary navigation',
        'nav.viewResults': 'View results',
```

- [ ] **Step 5: Verificar build**

Run: `npm run build`
Expected: éxito.

- [ ] **Step 6: Commit**

```bash
git add src/components/BottomNav.tsx src/components/StatusStrip.tsx src/components/SectionTabs.tsx src/i18n.tsx
git commit -m "feat(ui): BottomNav, StatusStrip and desktop SectionTabs components"
```

---

### Task 5: DatabasePanel dentro de BottomSheet

**Files:**
- Modify: `src/components/DatabasePanel.tsx:1-198`

- [ ] **Step 1: Refactorizar el contenedor del panel**

En `src/components/DatabasePanel.tsx`:

1. Cambiar los imports de lucide: ya no se usan `X` ni el header propio (BottomSheet los aporta):

```tsx
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Loader } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import type { ShaftEntry } from '../data/equipment/types'
```

2. Sustituir TODO el bloque `return (...)` del componente `DatabasePanel` (desde `if (!open) return null` incluido hasta el cierre del primer fragmento) por:

```tsx
  if (!open) return null

  return (
    <>
      <BottomSheet open={open} onClose={handleClose} title={t('db.title')}>
        {db.status === 'loading' && (
          <div className="flex items-center gap-3 py-12 text-[var(--text-secondary)]">
            <Loader size={18} className="animate-spin" />
            <span className="text-[13px]">{t('db.loading')}</span>
          </div>
        )}

        {db.status === 'error' && (
          <div className="py-12 text-center">
            <p className="text-[13px] text-[var(--text-secondary)]">{t('db.error')}</p>
            <button
              onClick={() => setDb({ status: 'idle' })}
              className="mt-3 text-[12px] font-medium text-[var(--gold)] press-scale"
            >
              {t('db.retry')}
            </button>
          </div>
        )}

        {db.status === 'ready' && (
          <div className="space-y-3">
            <PanelSelect
              label={t('db.selectManufacturer')}
              value={manufacturer}
              onChange={(v) => { setManufacturer(v); setModel(''); setSize('') }}
              options={manufacturers.map((m) => ({ value: m, label: m }))}
            />
            <PanelSelect
              label={t('db.selectModel')}
              value={model}
              onChange={(v) => { setModel(v); setSize('') }}
              options={models.map((m) => ({ value: m, label: m }))}
              disabled={!manufacturer}
            />
            <PanelSelect
              label={t('db.selectVariant')}
              value={size}
              onChange={setSize}
              options={sizes.map((s) => ({ value: s, label: s }))}
              disabled={!model}
            />

            {selectedShaft && (
              <PreviewCard>
                <PreviewRow label={t('db.preview.spine')} value={selectedShaft.spine.toString()} />
                <PreviewRow label={t('db.preview.gpi')} value={`${selectedShaft.gpi}`} />
                <PreviewRow label={t('db.preview.length')} value={`${selectedShaft.stockLength}"`} />
                <PreviewRow label={t('db.preview.od')} value={`${selectedShaft.od}"`} />
                {selectedShaft.nockWeight > 0 && <PreviewRow label={t('db.preview.nock')} value={`${selectedShaft.nockWeight}gr`} />}
                {selectedShaft.bushingPin > 0 && <PreviewRow label={t('db.preview.bushing')} value={`${selectedShaft.bushingPin}gr`} />}
                {selectedShaft.pointInsert > 0 && <PreviewRow label={t('db.preview.insert')} value={`${selectedShaft.pointInsert}gr`} />}
              </PreviewCard>
            )}

            <button
              onClick={handleApplyClick}
              disabled={!selectedShaft}
              className={`mt-4 w-full rounded-[14px] py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-all duration-150 press-scale ${
                selectedShaft
                  ? 'bg-[var(--gold)] text-[var(--bg-primary)] hover:bg-[var(--gold-light)]'
                  : 'cursor-not-allowed bg-[var(--bg-elevated)] text-[var(--text-muted)]'
              }`}
            >
              {t('db.apply')}
            </button>
          </div>
        )}
      </BottomSheet>

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
    </>
  )
```

Los helpers `PanelSelect`, `PreviewCard` y `PreviewRow` no cambian. La lógica de estado (hooks, `handleClose`, `handleApply`, `handleApplyClick`) tampoco.

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: éxito sin avisos de imports sin usar (`X` eliminado).

- [ ] **Step 3: Verificación manual rápida**

Run: `npm run dev` y abrir el panel desde la pestaña de flecha: debe deslizar desde abajo, cerrarse con Escape/backdrop y conservar selects en cascada + preview + confirmación.

- [ ] **Step 4: Commit**

```bash
git add src/components/DatabasePanel.tsx
git commit -m "refactor(ui): DatabasePanel served from BottomSheet"
```

---

### Task 6: App shell — reestructurar `App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/components/Toolbar.tsx`
- Delete: `src/components/TabNavigation.tsx`

- [ ] **Step 1: Actualizar imports y tipo `ActiveTab`**

Bloque de imports completo de `src/App.tsx`:

```tsx
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useI18n } from './i18n.tsx'
import { calculateSpineMatch } from './utils/archeryCalculator'
import { BottomNav, type BottomNavItem } from './components/BottomNav'
import { StatusStrip } from './components/StatusStrip'
import { SectionTabs, type SectionTabId } from './components/SectionTabs'
import { SettingsSheet } from './components/SettingsSheet'
import { ResultsSummary } from './components/ResultsSummary'
import { TuningAssistant } from './components/TuningAssistant'
import { SetupComparator, type SetupComparisonEntry } from './components/SetupComparator'
import { FormSection } from './components/FormSection'
import { FieldGroup } from './components/FieldGroup'
import { InputField } from './components/InputField'
import { SelectField } from './components/SelectField'
import { DatabasePanel } from './components/DatabasePanel'
import type { ShaftEntry } from './data/equipment/types'
import { Search, SlidersHorizontal } from 'lucide-react'
import { buildTuningActions } from './utils/tuningAssistant'
import {
  formatInputDisplayValue,
  getUnitLabel,
  toCanonicalInputValue,
  type ConvertibleField,
  type UnitSystem,
} from './utils/unitSystem'
```

(Se quita `useRef`; se quitan `Toolbar` y `TabNavigation`.)

Cambiar el tipo:

```tsx
type ActiveTab = 'bow' | 'arrow' | 'string' | 'results'
```

- [ ] **Step 2: Hook `useIsDesktop` y cambios de estado**

Añadir justo antes de `function App()`:

```tsx
const DESKTOP_QUERY = '(min-width: 1024px)'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}
```

Dentro de `App()`:

1. Eliminar estas declaraciones y el efecto del observer (`dbPanelOpen` SÍ se conserva):
   - `const resultsRef = useRef<HTMLDivElement | null>(null)`
   - `const [resultsInView, setResultsInView] = useState(false)`
   - el `useEffect` completo del `IntersectionObserver` (líneas 106-115 actuales).
2. Añadir tras `const [dbPanelOpen, setDbPanelOpen] = useState(false)`:

```tsx
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isDesktop = useIsDesktop()
```

3. Renombrar el memo `stickyBarBorderColor` a `statusAccentColor` (mismo cuerpo).

- [ ] **Step 3: Derivados de navegación**

Sustituir el array `const tabs = [...]` (líneas 333-355 actuales) por:

```tsx
  const formTab: SectionTabId = activeTab === 'results' ? 'bow' : activeTab

  const sectionTabs = [
    {
      id: 'bow' as const,
      label: t('nav.bow'),
      detail: `${bowProgress}/${BOW_CORE_FIELDS.length}`,
      complete: bowProgress === BOW_CORE_FIELDS.length,
    },
    {
      id: 'arrow' as const,
      label: t('nav.arrow'),
      detail: `${arrowProgress}/${ARROW_CORE_FIELDS.length}`,
      complete: arrowProgress === ARROW_CORE_FIELDS.length,
    },
    {
      id: 'string' as const,
      label: t('nav.string'),
      detail: `${stringProgress}/${STRING_CORE_FIELDS.length}`,
      complete: stringProgress === STRING_CORE_FIELDS.length,
    },
  ]

  const navItems: BottomNavItem[] = [
    { id: 'bow', label: t('nav.bow'), complete: bowProgress === BOW_CORE_FIELDS.length },
    { id: 'arrow', label: t('nav.arrow'), complete: arrowProgress === ARROW_CORE_FIELDS.length },
    { id: 'string', label: t('nav.string'), complete: stringProgress === STRING_CORE_FIELDS.length },
    {
      id: 'results',
      label: t('nav.results'),
      statusColor: spineMatch.status != null ? statusAccentColor : null,
    },
  ]
```

- [ ] **Step 4: Nuevo JSX de retorno**

Las funciones `renderBowSection`, `renderArrowSection` y `renderStringSection` NO cambian. Sustituir todo el `return (...)` de `App` por:

```tsx
  const resultsContent = (
    <>
      <ResultsSummary
        result={spineMatch}
        matchColor={matchColor}
        matchLabel={matchLabel}
        getMatchIndexPosition={getMatchIndexPosition}
        unitSystem={unitSystem}
        t={t}
      />

      <TuningAssistant actions={tuningActions} status={spineMatch.status} t={t} />

      {(spineMatch.warnings.length > 0 || spineMatch.recommendations.length > 0) && (
        <div className="mt-6 space-y-5">
          {spineMatch.warnings.length > 0 && (
            <AlertPanel title={t('alerts.warnings')} tone="warning" items={spineMatch.warnings} />
          )}
          {spineMatch.recommendations.length > 0 && (
            <AlertPanel title={t('alerts.recommendations')} tone="info" items={spineMatch.recommendations} />
          )}
        </div>
      )}

      <SetupComparator
        entries={comparisonEntries}
        bestEntryId={bestComparisonEntryId}
        onLoadSlot={loadConfiguration}
        unitSystem={unitSystem}
        t={t}
      />
    </>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header
        className="sticky top-0 z-40 safe-top"
        style={{ backgroundColor: 'rgba(11,11,11,0.94)', backdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center justify-between px-4 lg:max-w-[1080px]">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--gold)]">{t('app.kicker')}</p>
            <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
              {t('app.title')}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('settings.title')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all duration-150 press-scale hover:border-[var(--gold)]/40 hover:text-[var(--text-primary)]"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
        <div className="header-accent" />
      </header>

      <main className="mx-auto w-full max-w-[560px] px-4 pt-4 pb-[calc(9rem+env(safe-area-inset-bottom,0px))] lg:grid lg:max-w-[1080px] lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-10 lg:pb-16">
        <div className="min-w-0">
          {isDesktop && (
            <SectionTabs tabs={sectionTabs} active={formTab} onChange={(tab) => setActiveTab(tab)} />
          )}

          {(isDesktop || activeTab !== 'results') && (
            <div key={formTab} className="animate-fade-in">
              {formTab === 'bow' && renderBowSection()}
              {formTab === 'arrow' && renderArrowSection()}
              {formTab === 'string' && renderStringSection()}
            </div>
          )}

          {!isDesktop && activeTab === 'results' && (
            <div className="animate-fade-in">{resultsContent}</div>
          )}
        </div>

        {isDesktop && (
          <aside className="min-w-0">
            <div className="sticky top-20">{resultsContent}</div>
          </aside>
        )}
      </main>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={saveConfiguration}
        onLoad={loadConfiguration}
        onClear={clearInputs}
        lang={lang}
        onSetLang={setLang}
        unitSystem={unitSystem}
        onSetUnitSystem={setGlobalUnitSystem}
        t={t}
      />

      <DatabasePanel
        open={dbPanelOpen}
        onClose={() => setDbPanelOpen(false)}
        onApply={applyDatabaseSelection}
        hasExistingData={arrowSpecs.staticSpine.trim() !== '' || arrowSpecs.shaftGpi.trim() !== '' || arrowSpecs.shaftLength.trim() !== ''}
        t={t}
      />

      {!isDesktop && (
        <div className="fixed inset-x-0 bottom-0 z-40">
          {spineMatch.status != null && activeTab !== 'results' && (
            <StatusStrip
              label={matchLabel}
              matchIndex={spineMatch.matchIndex}
              accentColor={statusAccentColor}
              textClass={matchColor}
              onClick={() => setActiveTab('results')}
              ariaLabel={t('nav.viewResults')}
            />
          )}
          <BottomNav
            items={navItems}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab)}
            ariaLabel={t('nav.aria')}
          />
        </div>
      )}
    </div>
  )
```

(Desaparecen: `<Toolbar .../>`, `<TabNavigation .../>`, el `div ref={resultsRef}` y el botón sticky inferior con su lógica `resultsInView`. `AlertPanel` al final del archivo no cambia.)

- [ ] **Step 5: Borrar componentes sustituidos**

Run: `git rm src/components/Toolbar.tsx src/components/TabNavigation.tsx`
Expected: ambos archivos eliminados; ninguna referencia restante (verificar con `rg "Toolbar|TabNavigation" src`).

- [ ] **Step 6: Verificar build y lint**

Run: `npm run build` y `npm run lint`
Expected: ambos sin errores.

- [ ] **Step 7: Verificación manual**

Run: `npm run dev`
- Viewport 375×812: header de una fila, BottomNav con 4 pestañas, StatusStrip al introducir datos (toca → vista Resultados y la tira desaparece), sheet de ajustes (idioma/unidades/slots/borrar), panel de base de datos como sheet.
- Viewport 1280×800: SectionTabs sobre el formulario, resultados sticky a la derecha, sin BottomNav ni StatusStrip.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ui): mobile app shell with bottom navigation and results view"
```

---

### Task 7: Pulido de jerarquía (héroe de resultados + campos)

**Files:**
- Modify: `src/components/ResultsSummary.tsx:56-75`
- Modify: `src/components/InputField.tsx:67-79`

- [ ] **Step 1: Héroe de resultados**

En `src/components/ResultsSummary.tsx`:

1. La sección raíz deja de llevar borde inferior (ahora es una vista propia). Cambiar:

```tsx
    <section className="border-b border-[var(--border)] pb-6" aria-labelledby="results-heading">
```

por:

```tsx
    <section className="pb-2" aria-labelledby="results-heading">
```

2. Agrandar el estado del match. Cambiar la clase del `h2`:

```tsx
            className={`mt-3 break-words text-[30px] font-semibold leading-none tracking-tight sm:text-[34px] ${matchColor}`}
```

por:

```tsx
            className={`mt-3 break-words text-[34px] font-semibold leading-none tracking-tight sm:text-[38px] ${matchColor}`}
```

- [ ] **Step 2: Altura cómoda de inputs**

En `src/components/InputField.tsx`, en el `<input>`, cambiar `py-3` por `py-3.5` (el campo queda ≈50px de alto):

```tsx
            className="w-full bg-transparent px-0 py-3.5 pr-12 text-right font-mono text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: éxito.

- [ ] **Step 4: Commit**

```bash
git add src/components/ResultsSummary.tsx src/components/InputField.tsx
git commit -m "polish(ui): results hero scale and input touch height"
```

---

### Task 8: Verificación final

**Files:** ninguno nuevo (solo correcciones si algo falla).

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: 0 errores.

- [ ] **Step 2: Suite de tests existente**

Run: `npm test`
Expected: todos los tests de cálculo/datos en verde (mismo número de tests que antes del rediseño).

- [ ] **Step 3: Build de producción**

Run: `npm run build`
Expected: éxito.

- [ ] **Step 4: Pasada manual completa**

Run: `npm run dev` y recorrer en móvil (375×812) y escritorio (1280×800):
1. Navegar las 4 pestañas (móvil) / 3 secciones + panel derecho (escritorio).
2. Rellenar campos clave del arco y flecha → StatusStrip aparece con color de estado; tocarla lleva a Resultados.
3. Guardar en slot 1 desde el sheet de ajustes, borrar todo, cargar slot 1.
4. Cambiar idioma e unidades desde el sheet y comprobar etiquetas de la BottomNav.
5. Abrir base de datos, aplicar un shaft, confirmar sobrescritura.

- [ ] **Step 5: Commit de cierre (si hubo correcciones)**

```bash
git add -A
git commit -m "fix(ui): final pass after mobile redesign verification"
```
