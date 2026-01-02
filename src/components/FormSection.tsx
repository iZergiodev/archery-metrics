interface FormSectionProps {
  title: string
  icon: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, icon, children, className = '' }: FormSectionProps) {
  return (
    <section className={`bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 ${className}`}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100 mb-4">
        <span className="text-lg">{icon}</span>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </section>
  )
}
