interface FieldGroupProps {
  title: string
  description?: string
  tone?: 'primary' | 'neutral'
  children: React.ReactNode
}

export function FieldGroup({ title, description, children }: FieldGroupProps) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.28em] text-[#7f7f7f]">{title}</h3>
        {description && <p className="mt-1 text-[11px] leading-relaxed text-[#666666]">{description}</p>}
      </div>
      {children}
    </div>
  )
}
