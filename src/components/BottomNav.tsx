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
