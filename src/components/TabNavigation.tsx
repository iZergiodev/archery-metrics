
interface Tab {
  id: string
  label: string
  icon: string
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="mb-4 -mx-3 px-3">
      <div className="flex w-full bg-slate-800/80 rounded-lg p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center justify-center gap-2 flex-1 py-3 px-2 rounded-md
              text-sm font-medium whitespace-nowrap transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-slate-700 text-sky-400 shadow-sm'
                : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }
            `}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
