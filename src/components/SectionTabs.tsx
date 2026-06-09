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
