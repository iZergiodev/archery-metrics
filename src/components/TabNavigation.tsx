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
              className={`min-w-0 rounded-[14px] border px-2.5 py-3 text-left transition-colors ${
                isActive
                  ? 'border-[#facc15]/45 bg-[#181818] text-[#f8f8f8]'
                  : 'border-[rgba(255,255,255,0.08)] bg-[#111111] text-[#9a9a9a] hover:border-[rgba(255,255,255,0.16)] hover:text-[#dcdcdc]'
              }`}
            >
              <div className={`font-mono text-[10px] ${isActive ? 'text-[#facc15]' : 'text-[#5d5d5d]'}`}>{tab.icon}</div>
              <div className="mt-2 break-words text-[11px] uppercase leading-tight tracking-[0.08em]">{tab.label}</div>
              {tab.detail && (
                <div className={`mt-1 truncate text-[10px] ${isActive ? 'text-[#d9d9d9]' : 'text-[#666666]'}`}>{tab.detail}</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
