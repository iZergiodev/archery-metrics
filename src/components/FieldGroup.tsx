import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FieldGroupProps {
  title: string
  description?: string
  tone?: 'primary' | 'neutral'
  children: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function FieldGroup({ title, description, children, collapsible, defaultCollapsed = true }: FieldGroupProps) {
  const [collapsed, setCollapsed] = useState(collapsible ? defaultCollapsed : false)

  return (
    <div>
      <div className="mb-4">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={`flex w-full items-center justify-between gap-2 rounded-[10px] border border-dashed px-3 py-2.5 text-left transition-all duration-200 press-scale ${
              collapsed
                ? 'border-[var(--border-hover)] hover:border-[var(--gold)]/30 hover:bg-[var(--gold)]/5'
                : 'border-transparent'
            }`}
          >
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{title}</h3>
            <span className={`transition-all duration-200 ${collapsed ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
              <ChevronDown size={16} strokeWidth={2} />
            </span>
          </button>
        ) : (
          <h3 className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{title}</h3>
        )}
        {description && <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      {collapsible ? (
        <div className="grid-expand" data-collapsed={collapsed}>
          <div>
            <div className="space-y-5">{children}</div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
