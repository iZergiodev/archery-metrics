interface FormSectionProps {
  title: string
  icon: string
  children: React.ReactNode
  className?: string
  eyebrow?: string
  description?: string
}

export function FormSection({
  title,
  icon,
  children,
  className = '',
  eyebrow,
  description,
}: FormSectionProps) {
  return (
    <section
      className={`rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-5 ${className}`}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="break-words text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]/80">{eyebrow}</p>}
          <h2 className="mt-2 break-words text-[16px] font-semibold text-[var(--text-primary)]">{title}</h2>
          {description && <p className="mt-2 break-words text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>}
        </div>

        <div className="shrink-0 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[11px] text-[var(--gold)]">
          {icon}
        </div>
      </div>

      <div className="space-y-7">{children}</div>
    </section>
  )
}
