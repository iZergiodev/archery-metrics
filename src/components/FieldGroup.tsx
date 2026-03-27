import { useState } from 'react'

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
            className="flex w-full items-center justify-between gap-2 text-left press-scale"
          >
            <h3 className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{title}</h3>
            <span className="text-[10px] text-[var(--text-muted)] transition-transform duration-200" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
              ▼
            </span>
          </button>
        ) : (
          <h3 className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{title}</h3>
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
