import { useEffect, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
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

interface ToolbarProps {
  onSave: (slot: number) => void
  onLoad: (slot: number) => void
  onClear: () => void
  lang: 'es' | 'en'
  onSetLang: (lang: 'es' | 'en') => void
  unitSystem: UnitSystem
  onSetUnitSystem: (unitSystem: UnitSystem) => void
  t: {
    (key: string): string
  }
}

export function Toolbar({
  onSave,
  onLoad,
  onClear,
  lang,
  onSetLang,
  unitSystem,
  onSetUnitSystem,
  t,
}: ToolbarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [slotSummaries, setSlotSummaries] = useState<SlotSummary[]>(() => [
    { filled: false },
    { filled: false },
    { filled: false },
  ])

  useEffect(() => {
    if (showMenu) {
      setSlotSummaries([readSlotSummary(1), readSlotSummary(2), readSlotSummary(3)])
    }
  }, [showMenu])

  return (
    <div className="relative flex w-full items-center gap-2">
      <div className="grid min-w-0 flex-1 items-start grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] gap-2">
        <ToggleGroup
          label={t('toolbar.language')}
          options={[
            { label: 'ES', active: lang === 'es', onClick: () => onSetLang('es') },
            { label: 'EN', active: lang === 'en', onClick: () => onSetLang('en') },
          ]}
        />

        <ToggleGroup
          label={t('toolbar.units')}
          options={[
            { label: t('option.units.imperial.short'), active: unitSystem === 'imperial', onClick: () => onSetUnitSystem('imperial') },
            { label: t('option.units.metric.short'), active: unitSystem === 'metric', onClick: () => onSetUnitSystem('metric') },
          ]}
        />

        <div className="flex flex-col">
          <div className="mb-1 text-[9px] uppercase tracking-[0.16em] text-transparent select-none">.</div>
          <button
            onClick={() => setShowMenu((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center self-end rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all duration-150 press-scale hover:border-[var(--gold)]/40 hover:text-[var(--text-primary)]"
            aria-label={t('toolbar.actions')}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {showMenu && (
        <>
          <button
            type="button"
            aria-label="close menu"
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-[14px] border border-[var(--border)] p-3 shadow-2xl animate-fade-in card-surface">
            <MenuSection title={t('toolbar.save')}>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((slot) => (
                  <SlotButton
                    key={`save-${slot}`}
                    slot={slot}
                    summary={slotSummaries[slot - 1]}
                    variant="save"
                    onClick={() => {
                      onSave(slot)
                      setShowMenu(false)
                    }}
                  />
                ))}
              </div>
            </MenuSection>

            <MenuSection title={t('toolbar.load')}>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((slot) => (
                  <SlotButton
                    key={`load-${slot}`}
                    slot={slot}
                    summary={slotSummaries[slot - 1]}
                    variant="load"
                    disabled={!slotSummaries[slot - 1].filled}
                    onClick={() => {
                      onLoad(slot)
                      setShowMenu(false)
                    }}
                  />
                ))}
              </div>
            </MenuSection>

            <button
              onClick={() => {
                onClear()
                setShowMenu(false)
              }}
              className="mt-3 border-t border-[var(--border)] pt-3 text-[12px] uppercase tracking-[0.18em] text-[var(--target-red)] transition-colors hover:text-[var(--target-red)]/70"
            >
              {t('toolbar.clearAll')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SlotButton({
  slot,
  summary,
  variant,
  disabled = false,
  onClick,
}: {
  slot: number
  summary: SlotSummary
  variant: 'save' | 'load'
  disabled?: boolean
  onClick: () => void
}) {
  const summaryLine =
    summary.filled
      ? [summary.drawWeight ? `${summary.drawWeight}#` : null, summary.staticSpine ? `${summary.staticSpine}` : null]
          .filter(Boolean)
          .join(' · ')
      : '—'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-[10px] border border-[var(--border)] px-1 py-2 text-center transition-all duration-150 press-scale ${
        disabled
          ? 'cursor-not-allowed opacity-40'
          : variant === 'save'
            ? 'hover:border-[var(--gold)]/40 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
            : 'hover:border-[var(--gold)]/40 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
      }`}
    >
      <span className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">{slot}</span>
      <span className="w-full truncate font-mono text-[9px] leading-tight text-[var(--text-muted)]">{summaryLine}</span>
    </button>
  )
}

function ToggleGroup({
  label,
  options,
}: {
  label: string
  options: Array<{ label: string; active: boolean; onClick: () => void }>
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">{label}</div>
      <div className="grid min-w-0 grid-cols-2 gap-1 rounded-[12px] border border-[var(--border)] bg-[var(--bg-primary)] p-1">
        {options.map((option) => (
          <div key={option.label} className="min-w-0">
            <button
              onClick={option.onClick}
              className={`min-h-9 w-full min-w-0 rounded-[9px] px-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 press-scale ${
                option.active
                  ? 'bg-[var(--gold)] text-[var(--bg-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="block truncate">{option.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{title}</div>
      {children}
    </div>
  )
}

