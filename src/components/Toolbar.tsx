import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { UnitSystem } from '../utils/unitSystem'

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
            className="inline-flex h-10 w-10 items-center justify-center self-end rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[#151515] text-[#d8d8d8] transition-colors hover:border-[rgba(255,255,255,0.22)] hover:bg-[#191919] hover:text-[#f7f7f7]"
            aria-label={t('toolbar.actions')}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {showMenu && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111] p-3 shadow-2xl">
          <MenuSection title={t('toolbar.save')}>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((slot) => (
                <MenuButton
                  key={`save-${slot}`}
                  onClick={() => {
                    onSave(slot)
                    setShowMenu(false)
                  }}
                >
                  {slot}
                </MenuButton>
              ))}
            </div>
          </MenuSection>

          <MenuSection title={t('toolbar.load')}>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((slot) => (
                <MenuButton
                  key={`load-${slot}`}
                  onClick={() => {
                    onLoad(slot)
                    setShowMenu(false)
                  }}
                >
                  {slot}
                </MenuButton>
              ))}
            </div>
          </MenuSection>

          <button
            onClick={() => {
              onClear()
              setShowMenu(false)
            }}
            className="mt-3 border-t border-[rgba(255,255,255,0.08)] pt-3 text-[12px] uppercase tracking-[0.18em] text-[#ef4444] transition-colors hover:text-[#fecaca]"
          >
            {t('toolbar.clearAll')}
          </button>
        </div>
      )}
    </div>
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
      <div className="mb-1 text-[9px] uppercase tracking-[0.16em] text-[#737373]">{label}</div>
      <div className="grid min-w-0 grid-cols-2 gap-1 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#101010] p-1">
        {options.map((option) => (
          <div key={option.label} className="min-w-0">
            <button
              onClick={option.onClick}
              className={`min-h-9 w-full min-w-0 rounded-[9px] px-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                option.active
                  ? 'bg-[#facc15] text-[#181818]'
                  : 'text-[#b5b5b5] hover:bg-[#181818] hover:text-[#f7f7f7]'
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
      <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#5d5d5d]">{title}</div>
      {children}
    </div>
  )
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[10px] border border-[rgba(255,255,255,0.08)] px-0 py-2 text-[12px] text-[#d0d0d0] transition-colors hover:border-[rgba(255,255,255,0.16)] hover:bg-[#181818] hover:text-[#f7f7f7]"
    >
      {children}
    </button>
  )
}
