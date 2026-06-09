import { useState } from 'react'
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
  // Los slots solo cambian desde este sheet (onSave), así que basta con leer
  // localStorage al montar y refrescar tras cada guardado.
  const [slotSummaries, setSlotSummaries] = useState<SlotSummary[]>(() => [
    readSlotSummary(1),
    readSlotSummary(2),
    readSlotSummary(3),
  ])

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
