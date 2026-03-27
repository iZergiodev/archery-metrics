interface Tab {
  id: string
  label: string
  icon: string
  detail?: string
  complete?: boolean
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`min-w-0 rounded-[14px] border px-2.5 py-3 text-left transition-all duration-150 press-scale ${
                isActive
                  ? 'border-[var(--gold)]/45 bg-[var(--bg-elevated)] text-[var(--text-primary)] glow-gold'
                  : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className={`font-mono text-[10px] ${isActive ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}>{tab.icon}</div>
              <div className="mt-2 break-words text-[11px] uppercase leading-tight tracking-[0.08em]">{tab.label}</div>
              {tab.detail && (
                <div className={`mt-1 truncate text-[10px] ${isActive ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>{tab.detail}</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
